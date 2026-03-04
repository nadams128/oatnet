# Oatnet

**Oatnet** is a utility application for mutual aid organizations! Its front end is written in **TypeScript** using the **React** library, its back end is written in **Go**, and it uses **PostgreSQL** as its database.

## Table of Contents
* [Features](#features)
* [Development Environment Setup](#development-environment-setup)

## Features
* Create, read, update, and delete inventory items
* Search for existing items
* Mark items to be checked weekly
* Display a report of inventory items with filters to show all, weekly, or needed items, and filters for specified container sets
  * Edit items in the reports by clicking/tapping them
* Use routes and URL query parameters to navigate through parts of the application and link to pages
* Authenticate users with usernames and passwords
* Authorize users through an administrator panel
* Define sets of containers and how items should be split between them when restocking

## Development Environment Setup
1. `git clone git@github.com:nadams128/oatnet.git`
2. `cd oatnet`
### Front End
3. `cd` into the `ui` folder at the root of the project
4. Follow [the nvm install guide](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating) to install nvm
5. `nvm install node`
6. `npm i`
7. `npm run dev`
### Back End
8. `cd` into the `server` folder at the root of the project
9. Follow [the go install guide](https://go.dev/doc/install) to install go
10. `go work init .` to create a go workspace which tells go to use the `main()` in the current folder as the `main()` when running `go run .` or `go build` 
11. `go run .`
