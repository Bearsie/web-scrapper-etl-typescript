import { size } from 'lodash';
import React, { Component } from 'react';
import { ProductType, searchProducts } from '../apiRequests'; 
import NotifyContext, { NotifierType } from '../contexts/NotifyContext';
import { SearchForm } from './SearchForm';

type Props = {
    resetEtl: () => void;
    setProducts: (products: ProductType[]) => void;
};

type State = {
    isSearching: boolean;
    searchingDone: boolean,
    value: string;
};

class Search extends Component<Props, State> {
    public static contextType = NotifyContext;
    public state = {
        isSearching: false,
        searchingDone: false,
        value: '',
    };
    
    public render() {
        return (
            <SearchForm
                label="Search"
                onSubmit={this.handleSubmit}
                onChange={this.handleChange}
                placeholder="Search for product..."
                value={this.state.value}
                isSearchPending={this.state.isSearching}
            />
        );
    }

    private handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        this.setState({ value: event.target.value });
    };

    private handleSubmit: React.FormEventHandler = async (event) => {
        event.preventDefault();

        if (this.state.searchingDone) {
            this.props.resetEtl();
            this.setState({ searchingDone: false });
        }

        try {
            this.setState({ isSearching: true })
            const { data: products } = await searchProducts(this.state.value);
            this.setState({ searchingDone: true });

            if (products) {
                this.props.setProducts(products);
            }
            
            this.context.showNotifier(`Found ${size(products)} products`, NotifierType.Success);
        } catch (error) {
            this.context.showNotifier(error.message, NotifierType.Error);
        } finally {
            this.setState({ isSearching: false });
        }
    }
}

export default Search;
