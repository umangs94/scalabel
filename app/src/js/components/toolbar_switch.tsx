// tslint:disable:no-any
// TODO: remove the disable tag
import { ListItem, ListItemText } from '@material-ui/core'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import { withStyles } from '@material-ui/core/styles'
import Switch from '@material-ui/core/Switch'
import React from 'react'
import { switchStyle } from '../styles/label'

/**
 * Interface used for props.
 */
interface Props {
  /** onChange function */
  onChange: any
  /** values passed to onChange function . */
  value: any
  /** styles of SwitchButton. */
  classes: any
}

/**
 * This is a Switch Button component that
 * displays the list of selections.
 * @param {object} Props
 */
class SwitchButton extends React.Component<Props> {
  /**
   * SwitchButton render function
   */
  public render () {
    const { onChange, value, classes } = this.props

    // @ts-ignore
    return (
      <ListItem>
        <ListItemText classes={{ primary: classes.primary }}
          primary={value} />
        <ListItemSecondaryAction>
          <Switch
            classes={{
              switchBase: classes.colorSwitchBase,
              checked: classes.colorChecked
            }}
            onChange={onChange(value)}
            color='default'
          />
        </ListItemSecondaryAction>
      </ListItem>
    )
  }
}

export const SwitchBtn = withStyles(switchStyle)(SwitchButton)
