// Imports the Google Cloud client library
const { BigQuery } = require('@google-cloud/bigquery');

export type BigQueryField = { name: string, type: string, mode?: string };
export type BigQueryConfig = { dataSetId: string; tableId: string; tableIdPrefix: string, schema: BigQueryField[] };

function validateTableSchemaAsync(table: any, schema: BigQueryField[]) {
    return table.getMetadata().then(([metadata]) => {
        console.log(`Current schema of table ${table.id} is ${JSON.stringify(metadata.schema.fields)}`);
        console.log(`Required schema of table ${table.id} is ${JSON.stringify(schema)}`);

        if (!isEqualSchema(metadata.schema.fields, schema)) {
            console.log(`Updating schema of table ${table.id}...`);
            return table.setMetadata(Object.assign(metadata, { schema }))
                .then(() => {
                    console.log("Schema updated.");
                    return table;
                }, () => {
                    console.log("Couldn't update schema of table: " + table.id);
                });
        }
        else {
            console.log(`Schema of table ${table.id}... is already up to date.`);
            return new Promise(resolve => resolve(table));
        }
    });
}

function isEqualSchema(schema1: BigQueryField[], schema2: BigQueryField[]) {
    console.log(`Comparing fields length... ${schema1.length} <> ${schema2.length}`);
    if (schema1.length !== schema2.length) return false;

    return !schema1.some((field1, index) => {

        const field2 = schema2[index];
        console.log(`Comparing field...`);
        console.log(`${JSON.stringify(field1)}`);
        console.log(`${JSON.stringify(field2)}`);

        return field1.name !== field2.name ||
            field1.type !== field2.type ||
            field1.mode !== field2.mode;
    });
}

export function insertRows<T>(bigquery: typeof BigQuery, options: BigQueryConfig, rows: ReadonlyArray<T>) {
    const { dataSetId, tableId, tableIdPrefix = "", schema } = options;

    console.log(`Inserting ${rows.length} rows into ${tableId}`);

    const insertOptions = {
        schema,
        location: 'US'
    };

    if (!rows.length) return new Promise(resolve => resolve());

    // TODO: create dataset only once since insertRows can be called multiple times simultaneously!
    return bigquery
        .dataset(dataSetId)
        .get({ autoCreate: true })
        .then(([dataset]) => {
            console.log("dataset created");
            return dataset.table(`${tableIdPrefix}${tableId}`)
                .get({ autoCreate: true, ...insertOptions })
                .then(([table]) => validateTableSchemaAsync(table, insertOptions.schema))
                .then(table => table.insert(rows)
                    .then(() => {
                        console.log(`Inserted ${rows.length} rows`);
                        return `Inserted ${rows.length} rows`;
                    }, (error: { errors: string[], name: string, response: any, message: string }) => {
                        console.log(error.name);
                        console.log(error.message);
                        error.errors && error.errors.forEach(e => {
                            console.log(`${Object.keys(e).join(", ")}`);
                        });

                        console.log(error.response);
                    }, (e) => {
                        console.log(e);
                        console.log("Table could not be created");
                    }))
        }, e => {
            console.log(e);
            console.log("Dataset could not be created");
        });

}