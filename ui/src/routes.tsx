import React from 'react';

import { RouteObject, } from "react-router-dom";
import ListView from "./alerts/ListView";
import ShowView from "./alerts/ShowView";
import CreateView from './alerts/CreateView';

const routes: RouteObject[] = [
  {
    path: "/",
    element: <CreateView />,
  },
  {
    path: "/alerts",
    element: <ListView />,
  },
  {
    path: "/alerts/:uuid",
    element: <ShowView />,
  },
];

export default routes;
