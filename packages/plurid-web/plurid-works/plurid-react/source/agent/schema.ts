// #region module
/**
 * The subset of JSON Schema the agent's tools are written in: objects that name every field
 * (`additionalProperties: false`), strings, numbers, booleans, arrays and enums. Deliberately no
 * numeric or length constraints — a model provider's strict mode rejects them — so a tool checks
 * its ranges itself and answers with a reason.
 */
export interface PluridAgentSchema {
    type: 'object' | 'string' | 'number' | 'integer' | 'boolean' | 'array';
    description?: string;
    properties?: Record<string, PluridAgentSchema>;
    required?: string[];
    additionalProperties?: false;
    enum?: (string | number | boolean)[];
    items?: PluridAgentSchema;
}


const describeValue = (
    value: unknown,
) => (Array.isArray(value) ? 'an array' : value === null ? 'null' : typeof value);

/**
 * The first way `value` breaks `schema`, as a path and a reason a model can act on
 * (`input.planeID must be a string, got a number`), or `null` when it holds.
 */
export const validateAgentInput = (
    schema: PluridAgentSchema,
    value: unknown,
    path = 'input',
): string | null => {
    switch (schema.type) {
        case 'object': {
            if (typeof value !== 'object' || value === null || Array.isArray(value)) {
                return `${path} must be an object, got ${describeValue(value)}`;
            }
            const record = value as Record<string, unknown>;
            for (const key of schema.required ?? []) {
                if (record[key] === undefined) {
                    return `${path}.${key} is required`;
                }
            }
            const known = Object.keys(schema.properties ?? {});
            for (const [key, item] of Object.entries(record)) {
                const property = schema.properties?.[key];
                if (!property) {
                    if (schema.additionalProperties === false) {
                        return `${path}.${key} is not a field of this tool (its fields: ${known.join(', ') || 'none'})`;
                    }
                    continue;
                }
                if (item === undefined) {
                    continue;
                }
                const problem = validateAgentInput(property, item, `${path}.${key}`);
                if (problem) {
                    return problem;
                }
            }
            return null;
        }
        case 'array': {
            if (!Array.isArray(value)) {
                return `${path} must be an array, got ${describeValue(value)}`;
            }
            if (schema.items) {
                for (const [index, item] of value.entries()) {
                    const problem = validateAgentInput(schema.items, item, `${path}[${index}]`);
                    if (problem) {
                        return problem;
                    }
                }
            }
            return null;
        }
        case 'string':
            if (typeof value !== 'string') {
                return `${path} must be a string, got ${describeValue(value)}`;
            }
            break;
        case 'number':
            if (typeof value !== 'number' || !Number.isFinite(value)) {
                return `${path} must be a finite number, got ${describeValue(value)}`;
            }
            break;
        case 'integer':
            if (typeof value !== 'number' || !Number.isInteger(value)) {
                return `${path} must be an integer, got ${describeValue(value)}`;
            }
            break;
        case 'boolean':
            if (typeof value !== 'boolean') {
                return `${path} must be true or false, got ${describeValue(value)}`;
            }
            break;
    }
    if (schema.enum && !schema.enum.includes(value as string | number | boolean)) {
        return `${path} must be one of ${schema.enum.map((item) => JSON.stringify(item)).join(', ')}, got ${JSON.stringify(value)}`;
    }
    return null;
};
// #endregion module
