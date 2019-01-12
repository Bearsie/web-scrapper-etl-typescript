import { Button } from '@material-ui/core';
import { StyleRulesCallback, withStyles } from '@material-ui/core/styles';
import { ArrowDownward } from '@material-ui/icons';
import { isEmpty, join, map} from 'lodash';
import React, { Component } from 'react';
import { TransformedOpinionType } from '../apiRequests';
import { download } from './Download';

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

type ProductInfo = {
    attributes: Array<{ name: string; value: string }>;
    brand: string;
    category: string;
    productCode: number;
    productId: number;
    productNameId: string;
    title: string;
}

type Props = {
    classes: { [key: string]: string };
    opinion: TransformedOpinionType;
    productInfo: ProductInfo;
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
                    onClick={this.handleDownloadOpinion}
                    disabled={isEmpty(this.props.opinion)}
                >
                    Download
                    <ArrowDownward fontSize="inherit" className={classes.rightIcon} />
                </Button>
            </>
        );
    }

    private handleDownloadOpinion = async () => {
        if (isEmpty(this.props.opinion)) {
            return;
        }

        const txtData = this.convertToTxt(this.props.opinion, this.props.productInfo);
        download(txtData, 'opinion.txt', 'text/txt;charset=utf-8');
    }

    private convertToTxt = (opinion: TransformedOpinionType, productInfo: ProductInfo) => {
        const productFeatures = join(
            map(productInfo.attributes, (attribute) => `${attribute.name}: ${attribute.value}`),
            '; ',
        );
        
        const adaptedGrades = join(
            map(opinion.grades, (grade) => `${grade.attribute} ${grade.grade}`),
            '; ',
        );
        
        const data =  Object.assign(
            {},
            opinion,
            productInfo,
            { grades: adaptedGrades, attributes: productFeatures },
        );

        const productInfoTextLines = [
            `name: ${data.title}`,
            `category: ${data.category}`,
            `features: ${data.attributes}`,
            `brand: ${data.brand}`,
            `product code: ${data.productCode}`,
            `product id: ${data.productId}`,
            `product name id: ${data.productNameId}`,
        ];

        const opinionTextLines = [
            `title: ${data.opinionTitle}`,
            `content: ${data.content}`,
            `date: ${data.date.day}-${data.date.month}-${data.date.year}`,
            `id: ${data.opinionId}`,
            `purchase confirmed: ${data.purchaseConfirmed}`,
            `reviewer name: ${data.reviewerName}`,
            `total usefulness votes: ${data.totalUsefulnessVotes}`,
            `useful votes: ${data.usefulVotes}`,
            `not useful votes: ${data.notUsefulVotes}`,
            `usefulness rate: ${data.usefulnessRate}`,
            `grades: ${data.grades}`,
            `overall numerical grade: ${data.overallNumericalGrade}`,
            `overall verbal grade: ${data.overallVerbalGrade}`,
        ];

        const productInfoTxt = productInfoTextLines.reduce((text, line) => `${text}\r\n- ${line},`, 'Product Info:');
        const opinionTxt = opinionTextLines.reduce((text, line) => `${text}\r\n- ${line},`, 'Opinion:');
        const txt = `${productInfoTxt}\r\n\r\n${opinionTxt}`;

        return txt;
    }
}

export default withStyles(styles)(Download);