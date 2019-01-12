import { StyleRulesCallback, withStyles } from '@material-ui/core/styles';
import { filter as lodashFilter, get, map, some, trim } from 'lodash';
import matchSorter from 'match-sorter';
import React, { PureComponent } from 'react';
import ReactTable, { Column, Filter } from 'react-table';
import { getProducts, TransformedProductType } from '../apiRequests';
import NotifyContext, { NotifierType } from '../contexts/NotifyContext';
import Delete from './Delete';
import Download, { DataType } from './Download';
import DownloadOpinion from './DownloadOpinion';
import Update from './Update';


import 'react-table/react-table.css';

const styles: StyleRulesCallback = () => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        fontSize: '11px',
        justifyContent: 'center',
        margin: '0 10px',
    },
});

type Props = {
    classes: { [key: string]: string };
};

type State = {
    data: TransformedProductType[];
    loading: boolean;
};

class DataExplorer extends PureComponent<Props, State> {
    public static contextType = NotifyContext;

    public state = {
        data: [],
        loading: true,
    };

    public async componentDidMount() {
        try {
            const data = await getProducts();
            this.setState({ data, loading: false })
        } catch (error) {
            this.context.showNotifier(error.message, NotifierType.Error);
        } finally {
            this.setState({ loading: false })
        }
    }

    public render() {
        const { classes } = this.props;

        const columns: Column[] = [
            {
                Header: 'Product Name',
                accessor: 'title',
                filterAll: true,
                filterMethod: (filter: Filter, rows: any) =>
                    matchSorter(rows, filter.value, { keys: ['title'] }),
                minWidth: 200,
                style: { whiteSpace: 'normal' },
            },
            {
                Header: 'Category',
                accessor: 'category',
                filterAll: true,
                filterMethod: (filter: Filter, rows: any) =>
                    matchSorter(rows, filter.value, { keys: ['category'] }),
                style: { whiteSpace: 'normal' },
            },
            {
                Header: 'Brand',
                accessor: 'brand',
                filterAll: true,
                filterMethod: (filter: Filter, rows: any) =>
                    matchSorter(rows, filter.value, { keys: ['brand'] }),
            },
            {
                Header: 'Catalog Code',
                accessor: 'productCode',
                filterAll: true,
                filterMethod: (filter: Filter, rows: any) =>
                    matchSorter(rows, filter.value, { keys: ['productCode'] }),
            },
            {
                Header: 'Id',
                accessor: 'productId',
                filterAll: true,
                filterMethod: (filter: Filter, rows: any) =>
                    matchSorter(rows, filter.value, { keys: ['productId'] }),
            },
            {
                Cell: this.getFeaturesCell,
                Header: 'Features',
                accessor: 'attributes',
                filterAll: true,
                filterMethod: (filter: Filter, rows: any) => lodashFilter(
                    rows,
                    (row) => some(matchSorter(
                        row.attributes,
                        filter.value,
                        { keys: ['name', 'value'] },
                    )),
                ),
                id: 'features',
                minWidth: 300,
                style: { whiteSpace: 'normal' },
            },
            {
                Header: 'Opinions',
                accessor: 'rates.opinionsAmount',
                filterAll: true,
                filterMethod: (filter: Filter, rows: any) =>
                    matchSorter(rows, filter.value, { keys: ['opinionsAmount'] }),
                id: 'opinionsAmount',
                minWidth: 60,
            },
            {
                Header: 'Overall Rate',
                accessor: 'rates.overallRate',
                filterAll: true,
                filterMethod: (filter: Filter, rows: any) =>
                    matchSorter(rows, filter.value, { keys: ['overallRate'] }),
                id: 'overallRate',
            },
            {
                Cell: this.getRatedAttributesCell,
                Header: 'Rated Attributes',
                accessor: 'rates.ratedAttributes',
                filterAll: true,
                filterMethod: (filter: Filter, rows: any) => lodashFilter(
                    rows,
                    (row) => some(matchSorter(
                        row.ratedAttributes,
                        filter.value,
                        { keys: ['attributeName'] },
                    )),
                ),
                id: 'ratedAttributes',
                minWidth: 180,
            },
            {
                Header: 'Rates of Attributes',
                columns: [
                    {
                        Cell: this.getRatesOfAttribute,
                        Header: '"1"',
                        accessor: 'rates.ratedAttributes',
                        filterAll: true,
                        filterMethod: (filter: Filter, rows: any) => lodashFilter(
                            rows,
                            (row) => some(matchSorter(
                                row.attributeRatedAs1,
                                filter.value,
                                { keys: ['rates.rated1'] },
                            )),
                        ),
                        id: 'attributeRatedAs1',
                        minWidth: 60,
                    },
                    {
                        Cell: this.getRatesOfAttribute,
                        Header: '"2"',
                        accessor: 'rates.ratedAttributes',
                        filterAll: true,
                        filterMethod: (filter: Filter, rows: any) => lodashFilter(
                            rows,
                            (row) => some(matchSorter(
                                row.attributeRatedAs2,
                                filter.value,
                                { keys: ['rates.rated2'] },
                            )),
                        ),
                        id: 'attributeRatedAs2',
                        minWidth: 60,
                    },
                    {
                        Cell: this.getRatesOfAttribute,
                        Header: '"3"',
                        accessor: 'rates.ratedAttributes',
                        filterAll: true,
                        filterMethod: (filter: Filter, rows: any) => lodashFilter(
                            rows,
                            (row) => some(matchSorter(
                                row.attributeRatedAs3,
                                filter.value,
                                { keys: ['rates.rated3'] },
                            )),
                        ),
                        id: 'attributeRatedAs3',
                        minWidth: 60,
                    },
                    {
                        Cell: this.getRatesOfAttribute,
                        Header: '"4"',
                        accessor: 'rates.ratedAttributes',
                        filterAll: true,
                        filterMethod: (filter: Filter, rows: any) => lodashFilter(
                            rows,
                            (row) => some(matchSorter(
                                row.attributeRatedAs4,
                                filter.value,
                                { keys: ['rates.rated4'] },
                            )),
                        ),
                        id: 'attributeRatedAs4',
                        minWidth: 60,
                    },
                    {
                        Cell: this.getRatesOfAttribute,
                        Header: '"5"',
                        accessor: 'rates.ratedAttributes',
                        filterAll: true,
                        filterMethod: (filter: Filter, rows: any) => lodashFilter(
                            rows,
                            (row) => some(matchSorter(
                                row.attributeRatedAs5,
                                filter.value,
                                { keys: ['rates.rated5'] },
                            )),
                        ),
                        id: 'attributeRatedAs5',
                        minWidth: 50,
                    },
                    {
                        Cell: this.getRatesOfAttribute,
                        Header: 'Average',
                        accessor: 'rates.ratedAttributes',
                        filterAll: true,
                        filterMethod: (filter: Filter, rows: any) => lodashFilter(
                            rows,
                            (row) => some(matchSorter(
                                row.attributeAverageRate,
                                filter.value,
                                { keys: ['rates.average'] },
                            )),
                        ),
                        id: 'attributeAverageRate',
                    },
                ],
            },
            {
                Cell: (row: any) => {
                    return (
                        <div className={classes.container}>
                            <Download data={DataType.Product} source={[row.original]} />
                            <Update
                                source={[row.original]}
                                onUpdate={this.handleChangeData}
                                toggleLoading={this.handleToggleLoadingStatus}
                            />
                            <Delete
                                data={DataType.Product}
                                source={[row.original]}
                                onDelete={this.handleChangeData}
                                toggleLoading={this.handleToggleLoadingStatus}
                            />
                        </div>
                    );
                },
                minWidth: 130,
            },
        ];

        const numberOfProducts = get(this.state.data, 'length', 1);

        return (
            <>
            <Download data={DataType.All} source={this.state.data} />
            <Delete
                data={DataType.All}
                source={this.state.data}
                onDelete={this.handleChangeData}
                toggleLoading={this.handleToggleLoadingStatus}
            />
            <div className={classes.container} style={{ margin: 0 }}>
                <ReactTable
                    loading={this.state.loading}
                    data={this.state.data}
                    columns={columns}
                    filterable={true}
                    className={'-striped -highlight'}
                    SubComponent={this.renderOpinions}
                    minRows={numberOfProducts < 20 ? numberOfProducts : undefined}
                />
            </div>
            </>
        );
    }

    private readonly handleChangeData = (data: TransformedProductType[]) => {
        this.setState({ data });
    } 

    private handleToggleLoadingStatus = () => {
        this.setState(({ loading }) => ({ loading: !loading }));
    }

    private readonly renderOpinions = (props: any) => {
            const getPurchaseConfirmedCell = (row: any) => row.value ? 'yes' : 'no';
            const getOpinionIdCell = (row: any) => trim(row.value, 'opinion-');
            const getAttributes = (row: any) => map(
                row.value,
                (value) => <li key={value.attribute}>{value.attribute} {value.grade}</li>,
            );

            const columns = [
                {
                    Header: 'Title',
                    accessor: 'opinionTitle',
                    filterAll: true,
                    filterMethod: (filter: Filter, rows: any) =>
                        matchSorter(rows, filter.value, { keys: ['opinionTitle'] }),
                    minWidth: 150,
                },
                {
                    Header: 'Content',
                    accessor: 'content',
                    filterAll: true,
                    filterMethod: (filter: Filter, rows: any) =>
                        matchSorter(rows, filter.value, { keys: ['content'] }),
                    minWidth: 250,
                    style: { whiteSpace: 'normal' },
                },
                {
                    Header: 'Reviewer',
                    accessor: 'reviewerName',
                    filterAll: true,
                    filterMethod: (filter: Filter, rows: any) =>
                        matchSorter(rows, filter.value, { keys: ['reviewerName'] }),
                    minWidth: 80,
                },
                {
                    Cell: getPurchaseConfirmedCell,
                    Header: 'Purchase confirmed',
                    accessor: 'purchaseConfirmed',
                    filterAll: true,
                    filterMethod: (filter: Filter, rows: any) =>
                        matchSorter(rows, filter.value, { keys: ['purchaseConfirmed'] }),
                    minWidth: 80,
                },
                {
                    Cell: getOpinionIdCell,
                    Header: 'Id',
                    accessor: 'opinionId',
                    filterAll: true,
                    filterMethod: (filter: Filter, rows: any) =>
                        matchSorter(rows, filter.value, { keys: ['opinionId'] }),
                    minWidth: 60,
                },
                {
                    Header: 'Day',
                    accessor: 'date.day',
                    filterAll: true,
                    filterMethod: (filter: Filter, rows: any) =>
                        matchSorter(rows, filter.value, { keys: ['day'] }),
                    id: 'day',
                    minWidth: 30,
                    resizable: false,
                },
                {
                    Header: 'Month',
                    accessor: 'date.month',
                    filterAll: true,
                    filterMethod: (filter: Filter, rows: any) =>
                        matchSorter(rows, filter.value, { keys: ['month'] }),
                    id: 'month',
                    minWidth: 30,
                    resizable: false,
                },
                {
                    Header: 'Year',
                    accessor: 'date.year',
                    filterAll: true,
                    filterMethod: (filter: Filter, rows: any) =>
                        matchSorter(rows, filter.value, { keys: ['year'] }),
                    id: 'year',
                    minWidth: 30,
                    resizable: false,
                },
                {
                    Header: 'Usefulness',
                    accessor: 'usefulnessRate',
                    filterAll: true,
                    filterMethod: (filter: Filter, rows: any) =>
                        matchSorter(rows, filter.value, { keys: ['usefulnessRate'] }),
                    id: 'usefulnessRate',
                    minWidth: 60,
                    resizable: false,
                },
                {
                    Header: 'Votes',
                    accessor: 'totalUsefulnessVotes',
                    filterAll: true,
                    filterMethod: (filter: Filter, rows: any) =>
                        matchSorter(rows, filter.value, { keys: ['totalUsefulnessVotes'] }),
                    id: 'totalUsefulnessVotes',
                    minWidth: 60,
                },
                {
                    Cell: getAttributes,
                    Header: "Attribute Rates",
                    accessor: "grades",
                    filterAll: true,
                    filterMethod: (filter: Filter, rows: any) => lodashFilter(
                        rows,
                        (row) => some(matchSorter(
                            row.attributes,
                            filter.value,
                            { keys: ['attribute', 'grade'] },
                        )),
                    ),
                    id: 'attributes', 
                },
                {
                    Cell: (row: any) => {
                        return (
                            <div className={this.props.classes.container}>
                                <DownloadOpinion
                                    opinion={row.original}
                                    productInfo={{
                                        attributes: props.original.attributes,
                                        brand: props.original.brand,
                                        category: props.original.category,
                                        productCode: props.original.productCode,
                                        productId: props.original.productId,
                                        productNameId: props.original.productNameId,
                                        title: props.original.title,
                                    }}
                                />
                                <Delete
                                    data={DataType.Opinion}
                                    source={[row.original]}
                                    onDelete={this.handleChangeData}
                                    toggleLoading={this.handleToggleLoadingStatus}
                                />
                            </div>
                        );
                    },
                    minWidth: 100,
                },
            ];

            const numberOfOpinions = get(props.original.opinions, 'length');

            return (
              <div style={{ padding: "20px" }}>
                <b>Opinions</b>
                <br /><br />
                <ReactTable
                  data={props.original.opinions}
                  columns={columns}
                  filterable={true}
                  minRows={numberOfOpinions < 20 ? numberOfOpinions : undefined}
                  className={'-striped -highlight'}
                />
              </div>
            )
    }

    private getFeaturesCell = (row: any) => map(row.value, (attribute) => (
        <li key={`${row.productId}${attribute._id}`}>
            {attribute.name}: {attribute.value}
        </li>
    ))

    private getRatedAttributesCell = (props: any) => {
        const attributeMarks = ['A', 'B', 'C', 'D', 'E', 'F'];
        return (
                map(props.value, (attribute, index) => (
                    <li key={`${props.row.productId}${attribute.attributeName}`} style={{ listStyleType: 'none' }}>
                        {attributeMarks[index]}: {attribute.attributeName}
                    </li>
                ))
        )
    }

    private getRatesOfAttribute = (props: any) => {
        const ratesToDisplay = props.column.Header === '"1"' ? map(props.value, (attribute) => attribute.rates.rated1)
            : props.column.Header === '"2"' ? map(props.value, (attribute) => attribute.rates.rated2)
            : props.column.Header === '"3"' ? map(props.value, (attribute) => attribute.rates.rated3)
            : props.column.Header === '"4"' ? map(props.value, (attribute) => attribute.rates.rated4)
            : props.column.Header === '"5"' ? map(props.value, (attribute) => attribute.rates.rated5)
            : map(props.value, (attribute) => attribute.rates.average);
        const attributesNames = map(props.value, (attribute) => attribute.attributeName);

        return map(ratesToDisplay, (rate: number, index) => {
            return (
                <li
                    key={`${props.row.productId}${attributesNames[index]}${props.column.Header}`}
                    style={{ listStyleType: 'none' }}
                >
                    {props.column.Header === 'Average' ? rate : `${rate} times`}
                </li>
            );
        });
    }
}

export default withStyles(styles)(DataExplorer);