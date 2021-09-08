import { GraphQLResolveInfo } from "graphql";
import {
  parseResolveInfo,
  simplifyParsedResolveInfoFragmentWithType, 
  ResolveTree
} from 'graphql-parse-resolve-info';

import { IUser } from "../db";
import { AuthChecker } from "type-graphql";

export interface IQueryContext {
  user : IUser;
};

export const getResolveFields = (resolveInfo : GraphQLResolveInfo) => {
  const parsedResolveInfo = parseResolveInfo(resolveInfo) as ResolveTree;
  return parsedResolveInfo.fieldsByTypeName;
}

export const customAuthChecker: AuthChecker<IQueryContext> = async (
  { root, args, context, info },
  roles,
) => {
  if(!context.user?._id)
    return false;

  return true;
};
