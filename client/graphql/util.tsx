import { DocumentNode, OperationDefinitionNode, DefinitionNode } from "graphql";

// Ref: https://github.com/apollographql/apollo-client/blob/945aa0bd838eb2593d34b2d819a45fe9b15725b5/src/utilities/graphql/getFromAST.ts
export function getOperationName(doc: DocumentNode): string | null {
  return (
    doc.definitions
      .filter(
        definition =>
          definition.kind === 'OperationDefinition' && definition.name,
      )
      .map((x: DefinitionNode) => (x as OperationDefinitionNode).name?.value)[0] || null
  );
};
