import React from 'react';

import { RouteObject, } from "react-router-dom";
import ListView from "./alerts/ListView";
import ShowView from "./alerts/ShowView";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <ListView />,
  },
  {
    path: "/alerts/:uuid",
    element: <ShowView />,
  },
];

export default routes;
