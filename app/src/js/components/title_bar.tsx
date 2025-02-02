// tslint:disable:no-any
// TODO: remove the disable tag
import * as fa from '@fortawesome/free-solid-svg-icons/index'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AppBar, IconButton, Toolbar, Tooltip } from '@material-ui/core'
import createStyles from '@material-ui/core/styles/createStyles'
import { withStyles } from '@material-ui/core/styles/index'
import Typography from '@material-ui/core/Typography'
import _ from 'lodash'
import React from 'react'
import { goToItem } from '../action/common'
import Session from '../common/session'
import { defaultAppBar } from '../styles/general'
import { Component } from './component'

const styles: any = (theme: any) => createStyles({
  appBar: {
    ...defaultAppBar,
    position: 'relative'
  },
  grow: {
    flexGrow: 1
  },
  titleUnit: {
    color: '#bbbbbb',
    margin: theme.spacing.unit * 0.5
  }
})

interface Props {
  /** Styles of TitleBar */
  classes: any
  /** Theme of TitleBar */
  theme: any
  /** title of TitleBar */
  title: string
  /** dashboardLink of TittleBar */
  dashboardLink: string
  /** instructionLink of TittleBar */
  instructionLink: string
}

/**
 * Go to the next Item
 */
function goToNextItem () {
  Session.dispatch(goToItem(Session.getState().current.item + 1))
}

/**
 * Go to the previous Item
 */
function goToPreviousItem () {
  Session.dispatch(goToItem(Session.getState().current.item - 1))
}

/**
 * Save the current state to the server
 */
function save () {
  // const state = Session.getState();
  // const xhr = new XMLHttpRequest();
  // xhr.open('POST', './postSaveV2');
  // xhr.send(JSON.stringify(state));
}

/**
 * turn assistant view on/off
 */
function toggleAssistantView () {
  // Session.dispatch({type: types.TOGGLE_ASSISTANT_VIEW});
}

/**
 * Title bar
 */
class TitleBar extends Component<Props> {
  /**
   * Render function
   * @return {React.Fragment} React fragment
   */
  public render () {
    const { classes } = this.props
    const { title } = this.props
    const { instructionLink } = this.props
    const { dashboardLink } = this.props
    const buttonInfo = [
      {
        title: 'Previous Image', onClick: goToPreviousItem,
        icon: fa.faAngleLeft
      },
      { title: 'Next Image', onClick: goToNextItem, icon: fa.faAngleRight },
      { title: 'Instructions', href: instructionLink, icon: fa.faInfo },
      { title: 'Keyboard Usage', icon: fa.faQuestion },
      { title: 'Dashboard', href: dashboardLink, icon: fa.faList },
      {
        title: 'Assistant View', onClick: toggleAssistantView,
        icon: fa.faColumns
      },
      { title: 'Save', onClick: save, icon: fa.faSave },
      { title: 'Submit', onClick: save, icon: fa.faCheck }
    ]
    const buttons = buttonInfo.map((b) => {
      const onClick = _.get(b, 'onClick', undefined)
      const href = _.get(b, 'href', '#')
      const target = ('href' in b ? 'view_window' : '_self')
      return (
              <Tooltip title={b.title}>
                <IconButton className={classes.titleUnit} onClick={onClick}
                            href={href} target={target}>
                  <FontAwesomeIcon icon={b.icon} size='xs'/>
                </IconButton>
              </Tooltip>
      )
    })
    return (
            <AppBar className={classes.appBar}>
              <Toolbar>
                <Typography variant='h6' noWrap>
                  {title}
                </Typography>
                <div className={classes.grow}/>
                {buttons}
              </Toolbar>
            </AppBar>
    )
  }
}

export default withStyles(styles, { withTheme: true })(TitleBar)
