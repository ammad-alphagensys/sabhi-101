import type { Query } from "mongoose";
import type { QueryString, IAPIFeatures, ParsedValue, LogicalOperator } from "@/type";


export class APIFeatures<TDoc>
  implements IAPIFeatures<TDoc> {
  query: Query<TDoc[], TDoc>;
  queryString: QueryString;
  cacheKey?: string;
  ttl?: number;

  constructor(query: Query<TDoc[], TDoc>, queryString: QueryString) {
    this.query = query;
    this.queryString = queryString;
  }


  /* FILTER */
  filter() {
    const queryObj: Record<string, string | undefined> = {
      ...this.queryString
    };

    const excludedFields = [
      "page",
      "sort",
      "limit",
      "fields",
      "populate",
      "search"
    ];

    excludedFields.forEach((el) => {
      delete queryObj[el];
    });

    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|ne)\b/g,
      (match) => `$${match}`
    );

    const parsedQuery = JSON.parse(queryStr) as Record<
      string,
      ParsedValue
    >;

    const finalQuery: Record<string, unknown> = {};

    for (const key in parsedQuery) {
      const value = parsedQuery[key];

      // Logical operators (custom syntax)
      if (
        typeof value === "object" &&
        value !== null &&
        ("or" in value || "and" in value)
      ) {
        const logicKey = ("or" in value ? "or" : "and") as LogicalOperator;

        const raw = (value as any)[logicKey];

        const logicValues: (string | number | boolean)[] =
          Array.isArray(raw) ? raw : JSON.parse(raw);

        // 🔥 Initialize once
        if (!Array.isArray(finalQuery[`$${logicKey}`])) {
          finalQuery[`$${logicKey}`] = [];
        }

        // 🔥 APPEND instead of overwrite
        (finalQuery[`$${logicKey}`] as any[]).push(
          ...logicValues.map((val) => ({
            [key]: val
          }))
        );

        continue;
      }

      // ✅ Mongo operators like $ne, $gte, $lt, etc.
      if (
        typeof value === "object" &&
        value !== null &&
        Object.keys(value).some(k => k.startsWith("$"))
      ) {
        finalQuery[key] = value;
        continue;
      }

      // Simple equality
      finalQuery[key] = value;
    }

    console.log(finalQuery);


    this.query = this.query.find(finalQuery);
    return this;
  }

  /* SORT */
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-created_at");
    }

    return this;
  }

  /* LIMIT FIELDS */
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  /* PAGINATE */
  paginate() {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  /* POPULATE */
  populate() {
    if (!this.queryString.populate) return this;

    // Example: "business:select(name,email),salesClerks:match(active:true)"
    const fields = this.queryString.populate.split(",").map(f => f.trim());

    fields.forEach(field => {
      const [path, options] = field.split(":");
      let populateOptions: any = { path };

      if (options) {
        options.split(";").forEach(opt => {
          const [key, val] = opt.split("(");
          if (val) {
            // remove trailing ')'
            populateOptions[key!] = val.replace(/\)$/, "");
          }
        });
      }

      this.query = this.query.populate(populateOptions);
    });


    // this.query = this.query.populate(populateOptions);
    return this;
  }

  /**
   * Cache query result
   * @param ttl seconds (default 24h)
   * @param customKey optional override
   */
  cache(ttl = 60 * 60 * 24, customKey?: string) {
    this.query.cache({ ttl, key: customKey });
    return this;
  }

}
