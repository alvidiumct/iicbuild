export interface DIUDepartment {
  name: string;
  code?: string;
  faculty: string;
}

export const DIU_FACULTIES = [
  'Faculty of Business Administration',
  'Faculty of Science and Information Technology',
  'Faculty of Agriculture Sciences',
  'Faculty of Engineering',
  'Faculty of Health and Life Sciences',
  'Faculty of Humanities & Social Sciences',
] as const;

export const DIU_DEPARTMENTS: DIUDepartment[] = [
  // Faculty of Business Administration
  {
    name: 'Department of Business Administration',
    faculty: 'Faculty of Business Administration',
  },
  {
    name: 'Department of Management',
    faculty: 'Faculty of Business Administration',
  },
  {
    name: 'Department of Real Estate',
    faculty: 'Faculty of Business Administration',
  },
  {
    name: 'Department of Tourism & Hospitality Management',
    faculty: 'Faculty of Business Administration',
  },
  {
    name: 'Department of Innovation & Entrepreneurship',
    faculty: 'Faculty of Business Administration',
  },
  {
    name: 'Department of Accounting',
    faculty: 'Faculty of Business Administration',
  },
  {
    name: 'Department of Finance & Banking',
    faculty: 'Faculty of Business Administration',
  },
  {
    name: 'Department of Marketing',
    faculty: 'Faculty of Business Administration',
  },

  // Faculty of Science and Information Technology
  {
    name: 'Department of Computer Science and Engineering',
    faculty: 'Faculty of Science and Information Technology',
  },
  {
    name: 'Department of Software Engineering',
    faculty: 'Faculty of Science and Information Technology',
  },
  {
    name: 'Department of Multimedia & Creative Technology (MCT)',
    faculty: 'Faculty of Science and Information Technology',
  },
  {
    name: 'Department of Computing and Information System',
    faculty: 'Faculty of Science and Information Technology',
  },
  {
    name: 'Department of Information Technology & Management (ITM)',
    faculty: 'Faculty of Science and Information Technology',
  },
  {
    name: 'Department of Robotics and Mechatronics Engineering',
    faculty: 'Faculty of Science and Information Technology',
  },

  // Faculty of Agriculture Sciences
  {
    name: 'Department of Agricultural Science',
    faculty: 'Faculty of Agriculture Sciences',
  },
  {
    name: 'Department of Fisheries',
    faculty: 'Faculty of Agriculture Sciences',
  },

  // Faculty of Engineering
  {
    name: 'Department of Information and Communication Engineering',
    faculty: 'Faculty of Engineering',
  },
  {
    name: 'Department of Textile Engineering',
    faculty: 'Faculty of Engineering',
  },
  {
    name: 'Department of Electrical and Electronic Engineering',
    faculty: 'Faculty of Engineering',
  },
  {
    name: 'Department of Architecture',
    faculty: 'Faculty of Engineering',
  },
  {
    name: 'Department of Civil Engineering',
    faculty: 'Faculty of Engineering',
  },

  // Faculty of Health and Life Sciences
  {
    name: 'Department of Environmental Science and Disaster Management',
    faculty: 'Faculty of Health and Life Sciences',
  },
  {
    name: 'Department of Pharmacy',
    faculty: 'Faculty of Health and Life Sciences',
  },
  {
    name: 'Department of Nutrition and Food Engineering',
    faculty: 'Faculty of Health and Life Sciences',
  },
  {
    name: 'Department of Public Health',
    faculty: 'Faculty of Health and Life Sciences',
  },
  {
    name: 'Department of Physical Education & Sports Science',
    faculty: 'Faculty of Health and Life Sciences',
  },
  {
    name: 'Department of Genetic Engineering and Biotechnology',
    faculty: 'Faculty of Health and Life Sciences',
  },

  // Faculty of Humanities & Social Sciences
  {
    name: 'Department of English',
    faculty: 'Faculty of Humanities & Social Sciences',
  },
  {
    name: 'Department of Law',
    faculty: 'Faculty of Humanities & Social Sciences',
  },
  {
    name: 'Department of Journalism, Media and Communication',
    faculty: 'Faculty of Humanities & Social Sciences',
  },
  {
    name: 'Department of Development Studies',
    faculty: 'Faculty of Humanities & Social Sciences',
  },
];

export const DIU_SEMESTERS = [
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  '5th Semester',
  '6th Semester',
  '7th Semester',
  '8th Semester',
  '9th Semester',
  '10th Semester',
  '11th Semester',
  '12th Semester',
];
