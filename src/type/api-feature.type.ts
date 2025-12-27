import { Query } from "mongoose";

/**
 *  INFO: An interface representing a query string object where each key maps to a query parameter value.
 */
export type QueryString = {
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
  populate?: string;

  // dynamic filters
  [key: string]: string | undefined;
};

/**
 * An interface representing the features for handling API queries such as filtering, sorting, field limiting,
 * pagination, and population of related data.
 */

export interface IAPIFeatures<TDoc> {
  query: Query<TDoc[], TDoc>;
  queryString: QueryString;

  filter(): this;
  sort(): this;
  limitFields(): this;
  paginate(): this;
  populate(): this;
}


export type MongoOperator = "gte" | "gt" | "lte" | "lt" | "ne";

export type LogicalOperator = "or" | "and";

export type ParsedValue =
  | string
  | number
  | Record<MongoOperator, string | number>
  | Record<LogicalOperator, string>;

