/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useContext } from "react";
import Navbar from "react-bootstrap/Navbar";

import { useIsAuthenticated } from "@azure/msal-react";
import { SignInButton } from "./SignInButton";
import { SignOutButton } from "./SignOutButton";
import AppContext from "../AppContext";

/**
 * Renders the navbar component with a sign-in or sign-out button depending on whether or not a user is authenticated
 * @param props
 */
export const PageLayout = (props) => {
  const isAuthenticated = useIsAuthenticated();
  const { readCalendars, setReadCalendars, tokenData } = useContext(AppContext);

  return (
    <>
      <Navbar bg="primary" variant="dark">
        <a className="navbar-brand" href="/">
          Microsoft Identity Platform
        </a>
        {isAuthenticated ? (
          <SignOutButton />
        ) : (
          <SignInButton readCalendars={readCalendars} />
        )}
      </Navbar>
      <h5>
        <center>
          Welcome to the Microsoft Authentication Library For Javascript - React
          Quickstart
        </center>
      </h5>
      <br />

      {!tokenData && <div style={{ textAlign: "center" }}>
        <input
          type="checkbox"
          id="readCalendars"
          name="readCalendars"
          value={readCalendars}
          onClick={(e) => {
            setReadCalendars(!readCalendars);
          }}
        ></input>
        <label for="readCalendars" style={{ marginLeft: '1em' }}>
          Read my Calendars too
        </label>
        <br />
      </div>}

      {props.children}
    </>
  );
};
