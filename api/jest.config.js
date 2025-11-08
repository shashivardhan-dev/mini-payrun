import { pathsToModuleNameMapper } from 'ts-jest';
import { readFileSync } from 'fs';

const tsconfig = JSON.parse(readFileSync('./tsconfig.json', 'utf-8'));

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths || {}, {
    prefix: '<rootDir>/',
  }),
};
