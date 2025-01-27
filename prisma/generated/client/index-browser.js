
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.2.1
 * Query Engine version: 4123509d24aa4dede1e864b46351bf2790323b69
 */
Prisma.prismaVersion = {
  client: "6.2.1",
  engine: "4123509d24aa4dede1e864b46351bf2790323b69"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  username: 'username',
  fullname: 'fullname',
  email: 'email',
  password: 'password',
  isVerified: 'isVerified',
  avatar: 'avatar',
  gender: 'gender',
  dob: 'dob',
  lastEdu: 'lastEdu',
  domicileId: 'domicileId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AdminScalarFieldEnum = {
  id: 'id',
  companyName: 'companyName',
  email: 'email',
  password: 'password',
  phoneNumber: 'phoneNumber',
  description: 'description',
  isVerified: 'isVerified',
  logo: 'logo',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DeveloperScalarFieldEnum = {
  id: 'id',
  email: 'email',
  password: 'password'
};

exports.Prisma.JobScalarFieldEnum = {
  id: 'id',
  title: 'title',
  adminId: 'adminId',
  banner: 'banner',
  category: 'category',
  role: 'role',
  salary: 'salary',
  description: 'description',
  endDate: 'endDate',
  isPublished: 'isPublished',
  isTestActive: 'isTestActive',
  tags: 'tags',
  locationId: 'locationId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CurriculumVitaeScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  summary: 'summary',
  experience: 'experience',
  skill: 'skill',
  education: 'education',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LocationScalarFieldEnum = {
  id: 'id',
  location: 'location',
  displayLocation: 'displayLocation',
  latitude: 'latitude',
  longitude: 'longitude'
};

exports.Prisma.SubscriptionScalarFieldEnum = {
  id: 'id',
  category: 'category',
  price: 'price',
  feature: 'feature',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PreSelectionTestScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  jobId: 'jobId',
  createdAt: 'createdAt'
};

exports.Prisma.SelectionTestQuestionScalarFieldEnum = {
  id: 'id',
  preSelectionTestId: 'preSelectionTestId',
  question: 'question',
  options: 'options',
  correctAnswer: 'correctAnswer'
};

exports.Prisma.JobApplicationScalarFieldEnum = {
  userId: 'userId',
  jobId: 'jobId',
  resume: 'resume',
  expectedSalary: 'expectedSalary',
  status: 'status',
  isTaken: 'isTaken',
  rejectedReview: 'rejectedReview',
  selectionTestResult: 'selectionTestResult',
  createdAt: 'createdAt'
};

exports.Prisma.InterviewScalarFieldEnum = {
  userId: 'userId',
  jobId: 'jobId',
  startTime: 'startTime',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ReviewScalarFieldEnum = {
  userId: 'userId',
  jobId: 'jobId',
  review: 'review',
  CultureRating: 'CultureRating',
  balanceRating: 'balanceRating',
  facilityRating: 'facilityRating',
  careerRating: 'careerRating',
  salary: 'salary',
  createdAt: 'createdAt'
};

exports.Prisma.TransactionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  subscriptionId: 'subscriptionId',
  amount: 'amount',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AssessmentScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  createdAt: 'createdAt'
};

exports.Prisma.UserAssessmentScalarFieldEnum = {
  userId: 'userId',
  assessmentId: 'assessmentId',
  score: 'score',
  certificateId: 'certificateId',
  status: 'status',
  endTime: 'endTime'
};

exports.Prisma.AssessmentQuestionScalarFieldEnum = {
  id: 'id',
  assessmentId: 'assessmentId',
  question: 'question',
  options: 'options',
  correctAnswer: 'correctAnswer'
};

exports.Prisma.CertificateScalarFieldEnum = {
  id: 'id',
  CertificateUrl: 'CertificateUrl',
  badgeName: 'badgeName',
  badgeIcon: 'badgeIcon',
  createdAt: 'createdAt'
};

exports.Prisma.UserSubscriptionScalarFieldEnum = {
  userId: 'userId',
  subscriptionId: 'subscriptionId',
  startDate: 'startDate',
  endDate: 'endDate',
  isActive: 'isActive',
  assessmentCount: 'assessmentCount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.Gender = exports.$Enums.Gender = {
  female: 'female',
  male: 'male'
};

exports.LastEdu = exports.$Enums.LastEdu = {
  highSchoolDiploma: 'highSchoolDiploma',
  bachelor: 'bachelor',
  diploma: 'diploma',
  doctoral: 'doctoral',
  master: 'master'
};

exports.JobCategory = exports.$Enums.JobCategory = {
  accountancy: 'accountancy',
  sales: 'sales',
  marketing: 'marketing',
  engineering: 'engineering',
  construction: 'construction',
  tourism: 'tourism',
  administration: 'administration',
  manufacture: 'manufacture',
  informatics: 'informatics'
};

exports.SubscriptionCategory = exports.$Enums.SubscriptionCategory = {
  standard: 'standard',
  professional: 'professional'
};

exports.JobApplicationStatus = exports.$Enums.JobApplicationStatus = {
  rejected: 'rejected',
  accepted: 'accepted',
  processed: 'processed',
  interviewed: 'interviewed'
};

exports.TransactionStatus = exports.$Enums.TransactionStatus = {
  pending: 'pending',
  settlement: 'settlement',
  cancel: 'cancel'
};

exports.UserAssessmentStatus = exports.$Enums.UserAssessmentStatus = {
  failed: 'failed',
  passed: 'passed'
};

exports.Prisma.ModelName = {
  User: 'User',
  Admin: 'Admin',
  Developer: 'Developer',
  Job: 'Job',
  CurriculumVitae: 'CurriculumVitae',
  Location: 'Location',
  Subscription: 'Subscription',
  PreSelectionTest: 'PreSelectionTest',
  SelectionTestQuestion: 'SelectionTestQuestion',
  JobApplication: 'JobApplication',
  Interview: 'Interview',
  Review: 'Review',
  Transaction: 'Transaction',
  Assessment: 'Assessment',
  UserAssessment: 'UserAssessment',
  AssessmentQuestion: 'AssessmentQuestion',
  Certificate: 'Certificate',
  UserSubscription: 'UserSubscription'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
