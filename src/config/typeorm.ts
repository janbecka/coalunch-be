import { Column, ColumnOptions, ColumnType, CreateDateColumn } from 'typeorm';

const postgreSqliteTypeMapping: { [key: string]: ColumnType } = {
    bytea: 'text',
    timestamptz: 'datetime',
    //'mediumblob': 'blob'
};

export function resolveDbType(mySqlType: ColumnType): ColumnType {
    const isTestEnv = process.env.NODE_ENV === 'test';
    if (isTestEnv && (mySqlType as string) in postgreSqliteTypeMapping) {
        return postgreSqliteTypeMapping[mySqlType.toString()];
    }
    return mySqlType;
}

export function DbAwareColumn(columnOptions: ColumnOptions): PropertyDecorator {
    if (columnOptions.type) {
        columnOptions.type = resolveDbType(columnOptions.type);
    }
    return Column(columnOptions);
}

export function DbAwareCreateDateColumn(columnOptions: ColumnOptions): PropertyDecorator {
    if (columnOptions.type) {
        columnOptions.type = resolveDbType(columnOptions.type);
    }
    return CreateDateColumn(columnOptions);
}
