import FormControl from '@material-ui/core/FormControl'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import PropTypes from 'prop-types'
import React from 'react'
import NumberFormat from 'react-number-format'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      container: {
        display: 'flex',
        flexWrap: 'wrap'
      },
      formControl: {
        margin: theme.spacing(1)
      },
      input: {
        color: 'white'
      }
    })
)

interface NumberFormatCustomProps {
    /** inputRef */
  inputRef: (instance: NumberFormat | null) => void
    /** onChange function */
  onChange: (event: {
        /** target */
    target: {
            /** value */
      value: string }
  }) => void
}

/** NumberFormatCustom function */
function NumberFormatCustom (props: NumberFormatCustomProps) {
  const { inputRef, onChange, ...other } = props

  return (
        <NumberFormat
            {...other}
            format='##/##'
            placeholder={'00/99'}
            getInputRef={inputRef}
            onValueChange={(values: {
             /** value to change */
              value: string; }) => {
              onChange({
                target: {
                  value: values.value
                }
              })
            }}
        />
  )
}

NumberFormatCustom.propTypes = {
  inputRef: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired
} as any

interface State {
  /** textmask */
  textmask: string
  /** numberformat */
  numberformat: string
}

/** FormattedInputs Component */
export function FormattedInputs () {
  const classes = useStyles()
  const [values, setValues] = React.useState<State>({
    textmask: '(1  )    -    ',
    numberformat: '1320'
  })

  const handleChange = (name: keyof State) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
    setValues({
      ...values,
      [name]: event.target.value
    })
  }

  return (
        <div className={classes.container}>
            <FormControl className={classes.formControl}>
            </FormControl>
            <TextField
                className={classes.formControl}
                value={values.numberformat}
                onChange={handleChange('numberformat')}
                id='formatted-numberformat-input'
                InputProps={{
                  className: classes.input,
                  inputComponent: NumberFormatCustom as any
                }}
            />
        </div>
  )
}
