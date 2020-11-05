import React, { Fragment } from 'react';
import { Toolbar, ToolbarItem, ToolbarContent } from '@patternfly/react-core';
import { Button, InputGroup, TextInput } from '@patternfly/react-core';
import { Dropdown, DropdownToggle, DropdownToggleCheckbox } from '@patternfly/react-core';
import SearchIcon from '@patternfly/react-icons/dist/js/icons/search-icon';

const SkeletonTableToolbar = () => {

    const items = (
        <Fragment>
            <ToolbarItem>
                <Dropdown
                    toggle={
                        <DropdownToggle
                            isDisabled
                            splitButtonItems={ [
                                <DropdownToggleCheckbox id="skeleton-dropdown" key="skeleton-dropdown" aria-label="Loading Select all" />
                            ] }
                            id="skeleton-dropdown-toggle"
                        />
                    }
                />
            </ToolbarItem>
            <ToolbarItem>
                <InputGroup>
                    <TextInput
                        value="Search"
                        isDisabled
                        name="skeleton-search"
                        id="skeleton-search"
                        type="search"
                        aria-label="search loading" />
                    <Button isDisabled variant='control' aria-label="search button for search input">
                        <SearchIcon />
                    </Button>
                </InputGroup>
            </ToolbarItem>
            <ToolbarItem>
                <Button isDisabled variant="primary">Remove action</Button>
            </ToolbarItem>
        </Fragment>
    );

    return (
        <Toolbar id='skeleton-toolbar'>
            <ToolbarContent> { items } </ToolbarContent>
        </Toolbar>
    );
};

export default SkeletonTableToolbar;
