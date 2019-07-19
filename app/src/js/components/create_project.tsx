import AppBar from '@material-ui/core/AppBar'
import CssBaseline from '@material-ui/core/CssBaseline'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import { withStyles } from '@material-ui/core/styles'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import React from 'react'
import { createStyle, formStyle } from '../styles/create'
import CreateForm from './create_form'
import ProjectList from './sidebar_projects'

export interface ClassType {
  /** root class */
  root: string
  /** top bar on page */
  appBar: string
  /** sidebar class */
  drawer: string
  /** sidebar background */
  drawerPaper: string
  /** sidebar header */
  drawerHeader: string
  /** class for main content */
  content: string
  /** list header (existing projects) */
  listHeader: string
  /** class used for coloring alternating list item */
  coloredListItem: string
}

export interface Props {
  /** Create classes */
  classes: ClassType
}

export interface State {
  /** boolean to force reload of the sidebar project list */
  reloadProjects: boolean
}

/**
 * Component which display the create page
 * @param {object} props
 * @return component
 */
class Create extends React.Component<Props, State> {
  public constructor (props: Props) {
    super(props)
    this.state = {
      reloadProjects: false
    }
  }

  /**
   * render function, drawer code from
   * https://material-ui.com/components/drawers/
   * @return component
   */
  public render () {
    const { classes } = this.props
    return (
            <div className={classes.root}>
              <CssBaseline/>
              <AppBar
                      className={classes.appBar}
              >
                <Toolbar>
                  <Typography variant='h6' noWrap>
                    Open or create project
                  </Typography>
                </Toolbar>
              </AppBar>
              <Drawer
                      className={classes.drawer}
                      variant='permanent'
                      anchor='left'
                      classes={{
                        paper: classes.drawerPaper
                      }}
              >
                <div className={classes.drawerHeader}/>
                <List>
                  <ListItem>
                    <ListItemText primary={'Existing Projects'}
                                  className={classes.listHeader}
                    >
                    </ListItemText>
                  </ListItem>
                  <ProjectList classes={classes}
                               refresh={this.state.reloadProjects}/>
                </List>
              </Drawer>

              <main className={classes.content}>
                <StyledCreateForm projectReloadCallback=
                                          {this.projectReloadCallback}/>
              </main>
            </div>
    )
  }

  /**
   * callback used to force a state change to reload the project
   * list
   */
  private projectReloadCallback = () => {
    this.setState({ reloadProjects : !this.state.reloadProjects })
  }
}

const StyledCreateForm = withStyles(formStyle)(CreateForm)

/** export Create page */
export default withStyles(createStyle, { withTheme: true })(Create)
