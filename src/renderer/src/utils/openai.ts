import { Table, Relation } from '../store/useSchemaStore';

export async function generateSchemaFromText(prompt: string, apiKey: string): Promise<{ tables: Omit<Table, 'id' | 'position'>[], relations: Omit<Relation, 'id'>[] }> {
  const systemPrompt = `You are an expert database architect. The user will provide a description of a database schema.
You must return a STRICT JSON object representing the database schema.
The JSON must have the following structure:
{
  "tables": [
    {
      "name": "string",
      "columns": [
        {
          "name": "string",
          "type": "string (e.g. uuid, varchar, integer)",
          "isPk": boolean,
          "isNullable": boolean
        }
      ]
    }
  ],
  "relations": [
    {
      "sourceTable": "string",
      "sourceCol": "string",
      "targetTable": "string",
      "targetCol": "string"
    }
  ]
}

DO NOT wrap the response in markdown blocks. Return ONLY valid JSON.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    throw new Error('Failed to generate schema from OpenAI');
  }

  const data = await response.json();
  const schemaStr = data.choices[0].message.content;
  return JSON.parse(schemaStr);
}
