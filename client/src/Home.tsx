import { Paper, Typography } from '@material-ui/core';
import { StyleRulesCallback, withStyles } from '@material-ui/core/styles';
import React, { PureComponent } from 'react';

const styles: StyleRulesCallback = (theme) => ({
    container: {
        alignItems: 'center',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        padding: '20px 20%',
    },
    header: {
        width: '100%',
    },
    panel: {
        margin: '10px',
        padding: '20px',
        width: '70%',
    },
});

type Props = {
    classes: { [key: string]: string };
};

class Home extends PureComponent<Props> {
    public render() {
        const { classes } = this.props;

        return (
            <div className={classes.container}>
                <Typography className={classes.header} align="center" variant="h4">Welcome!</Typography>
                <Paper className={classes.panel} elevation={8}>
                    <Typography component="p">
                        Client-server application that allows to search for opinions about products from website
                        <b> www.euro.com.pl</b>, extracts and store them in database. Stored data can be explored, updated,
                        filtered, sorted and exported to *.csv file (all data, all opinions for product)
                        and to *.txt file (every single opinion).
                    </Typography>
                </Paper>
                <Paper className={classes.panel} elevation={8}>
                    <Typography component="p">
                        You have abbility to manage your data on three stages:
                    </Typography>
                    <Typography component="ul">
                        <li><b>Extract</b> - scrapes website www.euro.com.pl and extracting from it data about the products</li>
                        <li><b>Transform</b> - take data from extraction and transform it to be ready for database load</li>
                        <li><b>Load</b> - loading data to the MongoDB database</li>
                    </Typography>
                </Paper>
                <Paper className={classes.panel} elevation={8}>
                    <Typography component="p">
                        To abandon data for certain product, just simply deselect product checkbox.
                        You can perform all three action at ocne just use <b>ETL</b> button
                    </Typography>
                </Paper>
            </div>
        );
    }
}

export default withStyles(styles)(Home);