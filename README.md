# Xplor - Implementation
Xplor Implementation service is closely coupled to client side service which is responsible for performing necessary business logics & storage of user's actions and results. This layer communicated with Xplor Core Engine to fulfill user's requests & exposes a SSE connection for listening to the result data.

## Table of Contents

- [Pre-requisites](#pre-requisites)
- [Installation](#installation)
- [Running tests](#running-tests)
- [Working](#working-of-implementation)
- [Technologies](#technologies)
- [Configurations](#configurations)
- [Deployment](#deployment)
- [Contributing](#contributing)


## Pre-requisites
Below is the list of services you need in order to run this service.
- [Xplor Core Engine](https://github.com.com/xplor-core-engine) to communicate between Implementation and STG.
- [Xplor STG Service](https://github.com/xplor-stg) to communicate with network for request fulfillment.

## Installation

### Clone or fork this Project

```bash
 git clone REPOSITORY_LINK
```
    
### Setup Environment Variables(.env)
You need to setup the values for the environment variables. Below is the list of required .env variables

```bash
NODE_ENV=
PORT=
DATABASE_URL=
CORE_SERVICE_URL=
```
### Run service using Docker
Make sure you've the latest version of the docker installed in-order to run the application. Run the service with the following command

```bash
 docker compose --build
```

    
## Running Tests

The service has test cases for each module's service functions which you will get triggered on pushing the code to remote. You can run the test with the following command as well:

```bash
  npm test
```
    
## Working of Implementation
Implementation layer exposes endpoints like `/search`, `/select`, `/init`, `/confirm`, and `/status` and an endpoint `/sse` that is used to listen/observe to the response from this service. Client side will create a connection to SSE endpoint using a unique transaction_id(uuid) and will be mapped in SSE connections. Then the client will hit the appropriate api for ex. `/search`. Further, this service will process the request to Core Engine.

For receiving the response from Core Engine, Implementation services exposes the following endpoints: `/on_search`, `/on_select`, `/on_init`, `/on_confirm`, and `/on_status`. On receiving response on any of these endpoints, the service stores the response in database to further use it for payload creation for next steps. This service also stores the original request payload of the client. A module `Dump` is responsible for performing this storing process.

Implementation layer is best suitable for writing the business logics that are necessary for client side for example segregation payload, storing important fields, manipulation etc.

## Technologies Used

- **Backend Framework:** NestJS
- **Containerization:** Docker
- **Database:** MongoDB

## Configuration

System setup revolves around environment variables for ease of configuration. Key points include database settings, authentication parameters, and logging specifics. The `.env.example` file lists all necessary variables.

```bash
NODE_ENV=
PORT=
DATABASE_URL=
CORE_SERVICE_URL=
```

## Deployment

Deploying the Implementation service can be achieved through:

- **Docker**: Create a Docker image and launch your service.
- **Kubernetes**: Use Kubernetes for scalable container management.
- **CI/CD**: Automate deployment with CI/CD tools like Jenkins, GitLab CI, or GitHub Actions.

## Contributing

Contributions are welcomed! Please follow these steps to contribute:

#### 1. Fork the project.
#### 2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
#### 3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
#### 4. Push to the branch (`git push origin feature/AmazingFeature`).
#### 5. Open a pull request.

## License

Distributed under the MIT License. See [LICENSE.md](LICENSE.md) for more information.

## Acknowledgments

- Kudos to all contributors and the NestJS community.
- Appreciation for anyone dedicating time to enhance open-source software.
