import { Button } from '@material-ui/core';
import { StyleRulesCallback, withStyles } from '@material-ui/core/styles';
import { ArrowDownward } from '@material-ui/icons';
import { Parser } from 'json2csv';
import { isEmpty, join, map } from 'lodash';
import React, { Component } from 'react';
import { TransformedProductType } from '../apiRequests';

const styles: StyleRulesCallback = (theme) => ({
    button: {
        fontSize: '10px',
        margin: theme.spacing.unit,
        minHeight: 0,
        minWidth: 0,
        padding: '2px 4px',
    },
    rightIcon: {
        marginLeft: theme.spacing.unit,
    },
});

export const enum DataType {
    Opinion,
    Product,
    All,
};

type Props = {
    classes: { [key: string]: string };
    data: DataType;
    source: TransformedProductType[];
};

class Download extends Component<Props> {
    public render() {
        const { classes } = this.props;

        return (
            <>
                <Button
                    variant="contained"
                    color="default"
                    className={classes.button}
                    onClick={this.props.data === DataType.Product ? this.handleDownloadProduct
                        : this.props.data === DataType.Opinion ? this.handleDownloadOpinion
                        : this.handleDownloadAllData}
                    disabled={isEmpty(this.props.source)}
                >
                    Download
                    <ArrowDownward fontSize="inherit" className={classes.rightIcon} />
                </Button>
            </>
        );
    }

    private handleDownloadAllData = async () => {
        if (isEmpty(this.props.source)) {
            return;
        }

        const csvData = this.convertToCsv(this.props.source);
        download(csvData, 'products.csv', 'text/csv;charset=utf-8');
    }

    private handleDownloadProduct = async () => {      
        if (isEmpty(this.props.source)) {
            return;
        }

        const csvData = this.convertToCsv(this.props.source);
        download(csvData, 'product.csv', 'text/csv;charset=utf-8');
    }

    private handleDownloadOpinion = async () => {
        if (isEmpty(this.props.source)) {
            return;
        }

        const csvData = this.convertToCsv(this.props.source);
        download(csvData, 'product.csv', 'text/csv;charset=utf-8');
    }
    
    private convertToCsv = (data: TransformedProductType[]) => {
        const adaptedData = map(data, (item) => {
            const productFeatures = join(
                map(item.attributes, (attribute) => `${attribute.name}: ${attribute.value}`),
                '; ',
            );
            const adaptedOpinions = map(item.opinions, (opinion) => {
                const adaptedGrades = join(
                    map(opinion.grades, (grade) => `${grade.attribute} ${grade.grade}`),
                    '; ',
                );

                return Object.assign({}, opinion, { grades: adaptedGrades });
            });

            return Object.assign({}, item, { attributes: productFeatures, opinions: adaptedOpinions });
        });
        const fields = [
            { label: 'Product name', value: 'title' },
            { label: 'Category', value: 'category' },
            { label: 'Features', value: 'attributes' },
            { label: 'Brand', value: 'brand' },
            { label: 'Product code', value: 'productCode' },
            { label: 'Product id', value: 'productId' },
            { label: 'Product name id', value: 'productNameId' },
            { label: 'Opinions amount', value: 'rates.opinionsAmount' },
            { label: 'Overall rate (all opinions)', value: 'rates.overallRate' },
            { label: 'Opinion title', value: 'opinions.opinionTitle' },
            { label: 'Content', value: 'opinions.content' },
            { label: 'Date (day)', value: 'opinions.date.day' },
            { label: 'Date (month)', value: 'opinions.date.month' },
            { label: 'Date (year)', value: 'opinions.date.year' },
            { label: 'Opinion id', value: 'opinions.opinionId' },
            { label: 'Purchase confirmed', value: 'opinions.purchaseConfirmed' },
            { label: 'Reviewer name', value: 'opinions.reviewerName' },
            { label: 'Total usefulness votes', value: 'opinions.totalUsefulnessVotes' },
            { label: 'Useful votes', value: 'opinions.usefulVotes' },
            { label: 'Not useful votes', value: 'opinions.notUsefulVotes' },
            { label: 'Usefulness rate', value: 'opinions.usefulnessRate' },
            { label: 'Grades', value: 'opinions.grades' },
            { label: 'Opinion overall rate (numerical)', value: 'opinions.overallNumericalGrade' },
            { label: 'Opinion overall rate (verbal)', value: 'opinions.overallVerbalGrade' },
        ];
        const csvDataParser = new Parser({ fields, unwind: ['opinions'], unwindBlank: false });
        const csv = csvDataParser.parse(adaptedData);

        return csv;
    }
}

export const download = (data: string, fileName: string, fileType: string) => {
    const blob = new Blob([data], { type: fileType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

export default withStyles(styles)(Download);