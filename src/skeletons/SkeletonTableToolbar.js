import React, { Fragment } from 'react';
import { Toolbar, ToolbarItem, ToolbarContent } from '@patternfly/react-core';
import { Button, InputGroup, TextInput, InputGroupItem } from '@patternfly/react-core';
import {
	Dropdown,
	DropdownToggle,
	DropdownToggleCheckbox
} from '@patternfly/react-core/deprecated';
import SearchIcon from '@patternfly/react-icons/dist/js/icons/search-icon';

const SkeletonTableToolbar = () => {
  const items = (
    <Fragment>
      <ToolbarItem>
        <Dropdown
          toggle={
            <DropdownToggle
              isDisabled
              splitButtonItems={[
                <DropdownToggleCheckbox
                  id="skeleton-dropdown"
                  key="skeleton-dropdown"
                  aria-label="Loading Select all"
                />,
              ]}
              id="skeleton-dropdown-toggle"
            />
          }
        />
      </ToolbarItem>
      <ToolbarItem>
        <InputGroup>
          <InputGroupItem isFill ><TextInput
            value="Search"
            isDisabled
            name="skeleton-search"
            id="skeleton-search"
            type="search"
            aria-label="search loading"
          /></InputGroupItem>
          <InputGroupItem><Button
            isDisabled
            variant="control"
            aria-label="search button for search input"
          >
            <SearchIcon />
          </Button></InputGroupItem>
        </InputGroup>
      </ToolbarItem>
      <ToolbarItem>
        <Button isDisabled variant="primary">
          Remove action
        </Button>
      </ToolbarItem>
    </Fragment>
  );

  return (
    <Toolbar id="skeleton-toolbar">
      <ToolbarContent> {items} </ToolbarContent>
    </Toolbar>
  );
};

export default SkeletonTableToolbar;
