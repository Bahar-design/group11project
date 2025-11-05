// Jest setup: use the manual mock in __mocks__/pg.js so unit tests run
// without a real Postgres instance. Jest will automatically load the
// file at __mocks__/pg.js when we call jest.mock('pg').
jest.mock('pg');
