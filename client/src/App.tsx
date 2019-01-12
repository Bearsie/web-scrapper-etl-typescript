import { AppBar, Toolbar, Typography } from '@material-ui/core';
import { StyleRulesCallback, withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Notify } from './contexts/NotifyContext';
import DataExplorer from './DataExplorer';
import Etl from './Etl';
import Home from './Home';
import NavTabs from './NavTabs';

const styles: StyleRulesCallback = (theme) => ({
    grow: {
        flexGrow: 1,
    },
    header: {
        backgroundColor: theme.palette.background.paper,
        marginBottom: 10,
        width: '100%',
    },
});

type Props = {
    classes: { [key: string]: string };
}

const Title = ({ className }: { className: string }) => (
    <Typography variant="h4" color="primary" align="left" className={className}>
        PROJECT ETL
        <Typography variant="caption" color="default">
            Extract-Transform-Load data from website "www.euro.com.pl"
        </Typography>
    </Typography>
);

class App extends React.Component<Props> {
    public render() {
        return (
            <BrowserRouter>
                <Notify>
                    <header className={this.props.classes.header}>
                        <AppBar position="static" color="default">
                            <Toolbar>
                                <Title className={this.props.classes.grow} />
                                <NavTabs />
                            </Toolbar>
                        </AppBar>
                    </header>
                    <Switch>
                        <Route exact={true} path="/etl" component={Etl} />
                        <Route exact={true} path="/db" component={DataExplorer} />
                        <Route component={Home} />
                    </Switch>
                </Notify>
            </BrowserRouter>
        );
    }
}

export default withStyles(styles)(App);