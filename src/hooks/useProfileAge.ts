import { useEffect, useState } from 'react';
import { siteConfig } from '@/config';

function calculateAge(): string {
  const birthDate = new Date(
    siteConfig.birthDate.year,
    siteConfig.birthDate.month - 1,
    siteConfig.birthDate.day
  );
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    years--;
  }

  const thisYearBirthday = new Date(today.getFullYear(), siteConfig.birthDate.month - 1, siteConfig.birthDate.day);
  if (today < thisYearBirthday) {
    thisYearBirthday.setFullYear(today.getFullYear() - 1);
  }
  const daysSinceBirthday = Math.floor((today.getTime() - thisYearBirthday.getTime()) / (1000 * 60 * 60 * 24));

  return `${years} yrs ${daysSinceBirthday} days`;
}

export function useProfileAge(): string {
  const [age, setAge] = useState<string>('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAge(calculateAge());
    const ageInterval = setInterval(() => setAge(calculateAge()), 86400000);
    return () => clearInterval(ageInterval);
  }, []);

  return age;
}
