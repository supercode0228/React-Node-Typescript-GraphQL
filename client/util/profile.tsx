import { UserInfo, ResolvedUserSkill } from "../../shared/types";
import { isNullOrEmpty } from "../../shared/util/str";

export const calculateProfileCompletion = (
  userInfo : UserInfo | null,
  jobSkills : ResolvedUserSkill[],
  softSkills : ResolvedUserSkill[],
  softwareSkills : ResolvedUserSkill[],
) => {
  const profileCompletionFields = [
    { label: 'Profile Picture', value: (!isNullOrEmpty(userInfo?.avatar) ? 1.0 : 0.0) as number, url: `/user/${userInfo?.alias}/settings` },
    { label: 'About me', value: (!isNullOrEmpty(userInfo?.about) ? 1.0 : 0.0) as number, url: `/user/${userInfo?.alias}/edit` },
    // { label: '', value: (!isNullOrEmpty(userInfo?.location) ? 1.0 : 0.0) as number },
    { label: 'Job Experience', value: (!isNullOrEmpty(userInfo?.jobExperience) ? 1.0 : 0.0) as number, url: `/user/${userInfo?.alias}/edit` },
    { label: 'Organisation Role', value: (!isNullOrEmpty(userInfo?.skillArea) ? 1.0 : 0.0) as number, url: `/user/${userInfo?.alias}/edit` },
    { label: 'Job Title', value: (!isNullOrEmpty(userInfo?.jobTitle) ? 1.0 : 0.0) as number, url: `/user/${userInfo?.alias}/edit` },
    { label: 'Job Focus', value: (!isNullOrEmpty(jobSkills) ? 1.0 : 0.0) as number, url: `/skills/job?edit` },
    { label: 'Soft Skills', value: (!isNullOrEmpty(softSkills) ? 1.0 : 0.0) as number, url: `/skills/soft?edit` },
    { label: 'Technical skills', value: (!isNullOrEmpty(softwareSkills) ? 1.0 : 0.0) as number, url: `/skills/software?edit` },
  ];
  const profileCompletionPercent = profileCompletionFields.map(f => f.value).reduce((a, b) => a + b, 0.0) / profileCompletionFields.length;

  return {
    profileCompletionPercent,
    profileCompletionFields,
  };
};

interface AvatarParams {
  id? : string;
  avatar? : string;
}
export const userAvatarUrl = (params : AvatarParams | undefined) => {
  if(!params?.avatar)
    return '/icons/dummy-user.png';
  if(params?.avatar.startsWith('http://') || params?.avatar.startsWith('https://'))
    return params?.avatar;
  return `/static/user/${params?.id}/${params?.avatar}`;
};
export const teamAvatarUrl = (params : AvatarParams | undefined) => {
  if(!params?.avatar)
    return '/icons/dummy-company.png';
  return `/static/team/${params?.id}/${params?.avatar}`;
};
