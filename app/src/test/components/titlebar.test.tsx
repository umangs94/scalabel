import { cleanup } from '@testing-library/react'
import * as React from 'react'
import { create } from 'react-test-renderer'
import TitleBar from '../../js/components/title_bar'
import { IconButton } from '@material-ui/core'
import Session from '../../js/common/session'

afterEach(cleanup)

describe('Titlebar save function', () => {
  test('Save button triggers save function', () => {
    let open = jest.fn()
    let send = jest.fn()
    const xhrMockClass = () => ({
        open,
        send
    })

    const untypedWindow = window as any
    untypedWindow.XMLHttpRequest = jest.fn().mockImplementation(xhrMockClass)
    Session.initStore({"test":"here"})

    const titleBar = create(
        <TitleBar
            title={'title'}
            instructionLink={'instructionLink'}
            dashboardLink={'dashboardLink'}
        />
    )
    const saveButton = titleBar.root.findByProps({title: 'Save'})
    const realButton = saveButton.findByType(IconButton)
    realButton.props.onClick()
    expect(open).toBeCalled()
    const strSend = JSON.stringify({"test":"here"})
    const expectedStr = strSend.slice(1, -1)
    expect(send).toBeCalledWith(
        expect.stringContaining(expectedStr),
    )
  })
})
