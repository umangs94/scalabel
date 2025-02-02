package main

import (
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"path"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/mitchellh/mapstructure"
	uuid "github.com/satori/go.uuid"
)

// TODO: use actual worker ID
const DEFAULT_WORKER = "default_worker"

type NotExistError struct {
	name string
}

func (e *NotExistError) Error() string {
	return fmt.Sprintf("%s does not exist", e.name)
}

func Index2str(id int) string {
	return fmt.Sprintf("%06d", id)
}

/**
 * Fetch names of all existing projects in the data folder
**/
func GetExistingProjects() []string {
	files, err := ioutil.ReadDir(env.DataDir)
	names := []string{}
	if err != nil {
		return names
	}

	for _, f := range files {
		name := f.Name()
		// remove hidden files and the config file
		if !strings.ContainsAny(name, ".") {
			names = append(names, name)
		}
	}
	return names
}

func GetProject(projectName string) (Project, error) {
	fields, err := storage.Load(path.Join(projectName, "project"))
	project := Project{}
	if err != nil {
		return project, err
	}
	mapstructure.Decode(fields, &project)
	return project, nil
}

//Never used in scripts other than sat_test.go
func DeleteProject(projectName string) error {
	keys := storage.ListKeys(projectName)
	for _, key := range keys {
		err := storage.Delete(key)
		if err != nil {
			return err
		}
	}
	return nil
}

func GetTask(projectName string, index string) (Task, error) {
	fields, err := storage.Load(path.Join(projectName, "tasks", index))
	task := Task{}
	if err != nil {
		return task, err
	}
	mapstructure.Decode(fields, &task)
	return task, nil
}

func GetTasksInProject(projectName string) ([]Task, error) {
	if projectName == "" {
		return []Task{}, errors.New("Empty project name")
	}
	keys := storage.ListKeys(path.Join(projectName, "tasks"))
	tasks := []Task{}
	for _, key := range keys {
		fields, err := storage.Load(key)
		if err != nil {
			return []Task{}, err
		}
		task := Task{}
		mapstructure.Decode(fields, &task)
		tasks = append(tasks, task)
	}
	// sort tasks by index
	sort.Slice(tasks, func(i, j int) bool {
		return tasks[i].Index < tasks[j].Index
	})
	return tasks, nil
}

// Get the most recent assignment given the needed fields.
func GetAssignment(projectName string, taskIndex string, workerId string) (Assignment, error) {
	assignment := Assignment{}
	submissionsPath := path.Join(projectName, "submissions", taskIndex, workerId)
	keys := storage.ListKeys(submissionsPath)
	// if any submissions exist, get the most recent one
	if len(keys) > 0 {
		fields, err := storage.Load(keys[len(keys)-1])
		if err != nil {
			return Assignment{}, err
		}
		mapstructure.Decode(fields, &assignment)
	} else {
		assignmentPath := path.Join(projectName, "assignments", taskIndex, workerId)
		fields, err := storage.Load(assignmentPath)
		if err != nil {
			return Assignment{}, err
		}
		mapstructure.Decode(fields, &assignment)
	}
	// Asssigns default value for BundleFile
	// Should get rid of this and separate bundleFiles in the future
	if assignment.Task.ProjectOptions.LabelType != "tag" {
		assignment.Task.ProjectOptions.BundleFile = "image.js"
	}
	return assignment, nil
}

func CreateAssignment(projectName string, taskIndex string, workerId string) (Assignment, error) {
	task, err := GetTask(projectName, taskIndex)
	if err != nil {
		return Assignment{}, err
	}
	uuid := getUUIDv4()
	assignment := Assignment{
		Id:        uuid,
		Task:      task,
		WorkerId:  workerId,
		StartTime: recordTimestamp(),
	}
	storage.Save(assignment.GetKey(), assignment.GetFields())
	return assignment, nil
}

func GetDashboardContents(projectName string) (DashboardContents, error) {
	project, err := GetProject(projectName)
	if err != nil {
		return DashboardContents{}, err
	}
	tasks, err := GetTasksInProject(projectName)
	if err != nil {
		return DashboardContents{}, err
	}
	projectMetaData := ProjectMetaData{
		Name:              project.Options.Name,
		ItemType:          project.Options.ItemType,
		LabelType:         project.Options.LabelType,
		TaskSize:          project.Options.TaskSize,
		NumItems:          len(project.Items),
		NumLeafCategories: project.Options.NumLeafCategories,
		NumAttributes:     len(project.Options.Attributes),
	}
	taskMetaDatas := []TaskMetaData{}
	/* Iterate of tasks to send meta data for each one, instead of sending the entire
	task and doing this work later */
	for index, task := range tasks {
		taskMetaData := TaskMetaData{
			NumLabeledImages: countLabeledImages(projectName, index),
			NumLabels:        countLabelsInTask(projectName, index),
			Submitted:        taskSubmitted(projectName, index),
			HandlerUrl:       task.ProjectOptions.HandlerUrl,
		}
		taskMetaDatas = append(taskMetaDatas, taskMetaData)
	}
	return DashboardContents{
		ProjectMetaData: projectMetaData,
		TaskMetaDatas:   taskMetaDatas,
	}, nil
}

func GetHandlerUrl(itemType string, labelType string) string {
	switch itemType {
	case "image":
		if labelType == "box2d" || labelType == "segmentation" || labelType == "lane" {
			return "label2d"
		}
		if labelType == "tag" || labelType == "box2dv2" {
			return "label2dv2"
		}
		return "NO_VALID_HANDLER"
	case "video":
		if labelType == "box2d" || labelType == "segmentation" {
			return "label2d"
		} else {
			return "NO_VALID_HANDLER"
		}
	case "pointcloud":
		if labelType == "box3d" {
			return "label3d"
		} else if labelType == "box3dv2" {
			return "label3dv2"
		} else {
			return "NO_VALID_HANDLER"
		}
	case "pointcloudtracking":
		if labelType == "box3d" {
			return "label3d"
		} else {
			return "NO_VALID_HANDLER"
		}
	}
	return "NO_VALID_HANDLER"
}

func recordTimestamp() int64 {
	// record timestamp in seconds
	return time.Now().Unix()
}

func Exists(name string) bool {
	_, err := os.Stat(name)
	if os.IsNotExist(err) {
		return false
	} else {
		return true
	}
}

func Min(x, y int) int {
	if x < y {
		return x
	}
	return y
}

// Behavior is similar to path stem in Python
func PathStem(name string) string {
	name = path.Base(name)
	dotIndex := strings.LastIndex(name, ".")
	if dotIndex < 0 {
		return name
	} else {
		return name[:dotIndex]
	}
}

// check duplicated project name
// return false if duplicated
func CheckProjectName(projectName string) string {
	var newName = strings.Replace(projectName, " ", "_", -1)
	if storage.HasKey(path.Join(projectName, "project")) {
		Error.Printf("Project Name \"%s\" already exists.", projectName)
		return ""
	} else {
		return newName
	}
}

// Count the total number of images labeled in a task
func countLabeledImages(projectName string, index int) int {
	// return the number of labeled images in the import file if not initialized
	task, err := GetTask(projectName, Index2str(index))
	if task.NumLabeledItemImport > 0 {
		return task.NumLabeledItemImport
	}
	assignment, err := GetAssignment(projectName, Index2str(index), DEFAULT_WORKER)
	if err != nil {
		if _, ok := err.(*NotExistError); !ok {
			Error.Println(err)
			return 0
		}
	}
	return assignment.NumLabeledItems
}

// Count the total number of labels in a task
func countLabelsInTask(projectName string, index int) int {
	// return the number of labels in the import file if not initialized
	task, err := GetTask(projectName, Index2str(index))
	if task.NumLabelImport > 0 {
		return task.NumLabelImport
	}
	assignment, err := GetAssignment(projectName, Index2str(index), DEFAULT_WORKER)
	if err != nil {
		if _, ok := err.(*NotExistError); !ok {
			Error.Println(err)
			return 0
		}
	}
	// Count labels
	numLabels := len(assignment.Labels)
	// for videos, count the number of keyframes
	if assignment.Task.ProjectOptions.ItemType == "video" {
		numLabels = 0
		for _, label := range assignment.Labels {
			if label.Keyframe {
				numLabels += 1
			}
		}
	}
	return numLabels
}

// Check if a given task is submitted
func taskSubmitted(projectName string, index int) bool {
	assignment, err := GetAssignment(projectName, Index2str(index), DEFAULT_WORKER)
	if err != nil {
		return false
	}
	return assignment.Task.ProjectOptions.Submitted
}

// Get UUIDv4
func getUUIDv4() string {
	uuid, err := uuid.NewV4()
	if err != nil {
		Error.Println(err)
	}
	return uuid.String()
}

// default box2d category if category file is missing
var defaultBox2dCategories = []Category{
	{"person", nil},
	{"rider", nil},
	{"car", nil},
	{"truck", nil},
	{"bus", nil},
	{"train", nil},
	{"motor", nil},
	{"bike", nil},
	{"traffic sign", nil},
	{"traffic light", nil},
}

// default seg2d category if category file is missing
var defaultSeg2dCategories = []Category{
	{"void", []Category{
		{"unlabeled", nil},
		{"dynamic", nil},
		{"ego vehicle", nil},
		{"ground", nil},
		{"static", nil},
	}},
	{"flat", []Category{
		{"parking", nil},
		{"rail track", nil},
		{"road", nil},
		{"sidewalk", nil},
	}},
	{"construction", []Category{
		{"bridge", nil},
		{"building", nil},
		{"bus stop", nil},
		{"fence", nil},
		{"garage", nil},
		{"guard rail", nil},
		{"tunnel", nil},
		{"wall", nil},
	}},
	{"object", []Category{
		{"banner", nil},
		{"billboard", nil},
		{"fire hydrant", nil},
		{"lane divider", nil},
		{"mail box", nil},
		{"parking sign", nil},
		{"pole", nil},
		{"polegroup", nil},
		{"street light", nil},
		{"traffic cone", nil},
		{"traffic device", nil},
		{"traffic light", nil},
		{"traffic sign", nil},
		{"traffic sign frame", nil},
		{"trash can", nil},
	}},
	{"nature", []Category{
		{"terrain", nil},
		{"vegetation", nil},
	}},
	{"sky", []Category{
		{"sky", nil},
	}},
	{"human", []Category{
		{"person", nil},
		{"rider", nil},
	}},
	{"vehicle", []Category{
		{"bicycle", nil},
		{"bus", nil},
		{"car", nil},
		{"caravan", nil},
		{"motorcycle", nil},
		{"trailer", nil},
		{"train", nil},
		{"truck", nil},
	}},
}

// default lane2d category if category file is missing
var defaultLane2dCategories = []Category{
	{"road curb", nil},
	{"double white", nil},
	{"double yellow", nil},
	{"double other", nil},
	{"single white", nil},
	{"single yellow", nil},
	{"single other", nil},
	{"crosswalk", nil},
}

// default box2d attributes if attribute file is missing
var defaultBox2dAttributes = []Attribute{
	{"Occluded", "switch", "o",
		"", nil, nil, nil,
	},
	{"Truncated", "switch", "t",
		"", nil, nil, nil,
	},
	{"Traffic Light Color", "list", "", "t",
		[]string{"", "g", "y", "r"}, []string{"NA", "G", "Y", "R"},
		[]string{"white", "green", "yellow", "red"},
	},
}

// default attributes if attribute file is missing
// to avoid uncaught type error in Javascript file
var dummyAttribute = []Attribute{
	{"", "", "",
		"", nil, nil, nil,
	},
}

var floatMatch = `[+-]?(\d+(\.\d*)?|\d?\.\d+)`
var floatFinder = regexp.MustCompile(floatMatch)
var groundCoefficientsFinder = regexp.MustCompile(
	`comment\s*\[groundCoefficients\]\s*` +
		floatMatch + `\s*,\s*` + floatMatch + `\s*,\s*` +
		floatMatch + `\s*,\s*` + floatMatch)

func parsePLYForGround(url string) ([4]float64, error) {
	var coefficients [4]float64
	r, err := http.Get(url)
	if err != nil {
		return coefficients, err
	}
	defer r.Body.Close()
	contents, err := ioutil.ReadAll(r.Body)

	groundCoeffBytes := groundCoefficientsFinder.Find(contents)

	if groundCoeffBytes == nil {
		return coefficients, errors.New("Could not find ground coefficients")
	}

	coefficientByteArrays := floatFinder.FindAll(groundCoeffBytes, 4)

	if coefficientByteArrays == nil {
		return coefficients, errors.New("Error parsing ground coefficients")
	}

	if len(coefficientByteArrays) != 4 {
		return coefficients, errors.New("Incorrect number of ground coefficients")
	}

	for i, coeffArr := range coefficientByteArrays {
		coefficients[i], err = strconv.ParseFloat(string(coeffArr), 64)
		if err != nil {
			return coefficients, err
		}
	}

	return coefficients, nil
}
