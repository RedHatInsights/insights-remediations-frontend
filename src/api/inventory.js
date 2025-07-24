const INVENTORY_API_BASE = '/api/inventory/v1';

import { APIFactory } from '@redhat-cloud-services/javascript-clients-shared';
import axiosInstance from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import * as endpoints from '@redhat-cloud-services/host-inventory-client';

export const inventoryApi = APIFactory(INVENTORY_API_BASE, endpoints, {
  axios: axiosInstance,
});

export const getHostsById = (systems, { page, perPage }) =>
  inventoryApi.apiHostGetHostById(systems, null, perPage, page);

export const getHosts = () => inventoryApi.apiHostGetHostList();
