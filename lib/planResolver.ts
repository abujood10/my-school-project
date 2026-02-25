export function resolvePlanLimits(school: any) {
  const plan = school.expand?.plan;

  return {
    maxStudents:
      school.customMaxStudents ??
      plan?.maxStudents ??
      0,

    maxTeachers:
      school.customMaxTeachers ??
      plan?.maxTeachers ??
      0,

    durationDays:
      school.customDurationDays ??
      plan?.durationDays ??
      30,

    price:
      school.customPrice ??
      plan?.price ??
      0,
  };
}