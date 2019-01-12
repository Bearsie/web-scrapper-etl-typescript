import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Home from '@material-ui/icons/Home';
import TableChart from '@material-ui/icons/TableChart';
import TransformIcon from '@material-ui/icons/Transform';
import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

class NavTabs extends Component<RouteComponentProps> {
    public render () {
        return (
            <Tabs
                value={this.props.history.location.pathname}
                onChange={this.handleChange}
                indicatorColor="primary"
                textColor="primary"
            >
                <Tab label="Home" value="/" icon={<Home />} />
                <Tab label="ETL" value="/etl" icon={<TransformIcon />} />
                <Tab label="Explore data base" value="/db" icon={<TableChart />} />
            </Tabs>
       );
    }

    // tslint:disable-next-line:variable-name
    private handleChange = (_event: React.ChangeEvent<{}>, value: string) => {
        this.props.history.push(value);
    }
}
   
export default withRouter(NavTabs);