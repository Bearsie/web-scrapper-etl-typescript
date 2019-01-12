import React, { Component } from 'react';
import Notifier from './Notifier';

export const enum NotifierType {
    Success = 'success',
    Error = 'error',
}

type NotifyContext = {
    showNotifier: (notify: string, notifierType: NotifierType) => void,
};

const Context = React.createContext<NotifyContext>({
    showNotifier: () => {
        throw new Error('showNotifier() not implemented');
    }
});

type State = {
    notifierType: 'success' | 'error';
    notify: string;
    openNotifier: boolean;
};

export class Notify extends Component<{}, State> {
    public state = {
        notifierType: NotifierType.Success,
        notify: '',
        openNotifier: false,
    };

    public render() {
        return (
            <Context.Provider value={{ showNotifier: this.handleOpenNotifier }}>
                {this.props.children}
                <Notifier
                    message={this.state.notify}
                    type={this.state.notifierType}
                    onClose={this.handleCloseNotifier}
                    open={this.state.openNotifier}
                />
            </Context.Provider>
        );
    }

    private handleCloseNotifier = () => {
        this.setState({ openNotifier: false });
    };

    private handleOpenNotifier = (notify: string, notifierType: NotifierType) => {
        this.setState({ notify, notifierType, openNotifier: true });
    };
}

export default Context;