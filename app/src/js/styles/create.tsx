import { Theme } from '@material-ui/core/styles'
import createStyles from '@material-ui/core/styles/createStyles'

const fullWidth = 700

// Styles for the create page
export const createStyle = () => createStyles({
  listHeader: {
    textAlign: 'center'
  }
})

// Styles for sidebar project list
export const projectListStyle = (theme: Theme) => createStyles({
  coloredListItem: {
    backgroundColor: theme.palette.secondary.light
  }
})

// Styles for the create form
export const formStyle = (theme: Theme) => createStyles({
  root: {
    padding: theme.spacing(3),
    marginTop: theme.spacing(2)
  },
  fullWidthText: {
    width: fullWidth
  },

  halfWidthText: {
    width: fullWidth / 2
  },

  formGroup: {
    marginTop: theme.spacing(1)
  },

  selectEmpty: {
    width: (fullWidth - theme.spacing(1)) / 2,
    marginRight: theme.spacing(1)
  },

  submitButton: {
    marginRight: theme.spacing(1)
  },

  hidden: {
    visibility: 'hidden'
  }
})

// Styles for the upload buttons
export const uploadStyle = createStyles({
  root: {
    width: fullWidth / 3
  },

  button: {
    padding: 5,
    marginRight: 10,
    textTransform: 'initial'
  },

  textField: {
    width: 130
  },

  filenameText: {
    fontSize: 14,
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },

  grid: {
    marginTop: 5
  }
})

// Attribute upload override styling
export const attributeStyle = createStyles({
  root: {
    position: 'absolute',
    marginLeft: fullWidth * 2 / 3
  }
})

export const checkboxStyle = (theme: Theme) => createStyles({

  root: {
    '&$checked': {
      color: theme.palette.secondary.dark
    }
  },

  checked: {}
})
