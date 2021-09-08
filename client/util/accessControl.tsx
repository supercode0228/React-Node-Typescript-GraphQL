import { useRouter } from "next/router";
import { ApolloError } from "apollo-client";

import { UserInfo } from "../../shared/types";

/*
 * Check whether the GraphQL query returned a "Not authenticated" or an "Access denied" error.
 * If it does - redirect to '/login'
 */
export const ensureAccess = (error? : ApolloError) => {
  // const router = useRouter();
  if(typeof window !== 'undefined'
    && error 
    && (error.message === 'Not authenticated'
      || error.message === 'Access denied'
      || error.message === 'Access denied! You need to be authorized to perform this action!'
    )) {
    // router.push('/login');
    window.location.href = '/login';
  }
};


export const onlyOwnerAccess = (userInfo? : UserInfo | null) => {
  // const router = useRouter();
  if(typeof window !== 'undefined'
    && userInfo
    && !userInfo.me) {
    // router.push('/login');
    window.location.href = '/login';
  }
};
