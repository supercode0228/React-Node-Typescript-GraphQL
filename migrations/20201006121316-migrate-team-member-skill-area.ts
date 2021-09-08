/**
 * @format
 */

import { Db } from 'mongodb';
import skillAreas from '../shared/data/skillAreas.json';

export async function up(db: Db) {
  // Map valid skill areas
  const validSkillAreas = Object.keys(skillAreas).map((key) => ({
    value: key,
    ...(skillAreas as any)[key]
  }));

  // Find user teams where skill area is not set
  const userTeams = await db
    .collection('userteams')
    .find({ skillArea: null })
    .toArray();

  // Update skill area for user teams with data from user
  for (let i = 0; i < userTeams.length; i++) {
    const userTeam = userTeams[i];
    const user = await db.collection('users').findOne({ _id: userTeam.user });
    const skillArea = validSkillAreas.find((sa) => sa.value === user.skillArea)
      ?.label;

    await db
      .collection('userteams')
      .updateOne({ _id: userTeam._id }, { $set: { skillArea: skillArea } });
  }
}

export async function down() {
  return Promise.resolve('ok');
}
