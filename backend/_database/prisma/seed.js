/**
 * Ballot Builder - Database Seed Script
 *
 * This script populates the database with initial data:
 * - 50 policy statements across 10 issue areas (5 per area)
 *
 * Run with: npm run db:seed
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 50 Policy Statements (5 per category, 10 categories)
const policyStatements = [
  // Healthcare (5)
  {
    statementText: 'Healthcare should be provided by the government as a universal right for all citizens',
    issueArea: 'healthcare',
    specificityLevel: 'broad',
  },
  {
    statementText: 'Private health insurance companies should compete in an open market without government intervention',
    issueArea: 'healthcare',
    specificityLevel: 'broad',
  },
  {
    statementText: 'Prescription drug prices should be regulated by the federal government',
    issueArea: 'healthcare',
    specificityLevel: 'moderate',
  },
  {
    statementText: 'Employers should be required to provide health insurance to full-time employees',
    issueArea: 'healthcare',
    specificityLevel: 'moderate',
  },
  {
    statementText: 'Mental health services should receive the same insurance coverage as physical health services',
    issueArea: 'healthcare',
    specificityLevel: 'specific',
  },

  // Education (5)
  {
    statementText: 'Public schools should receive increased federal funding to improve educational outcomes',
    issueArea: 'education',
    specificityLevel: 'broad',
  },
  {
    statementText: 'Parents should be able to use public funds to send children to private or charter schools',
    issueArea: 'education',
    specificityLevel: 'broad',
  },
  {
    statementText: 'College tuition at public universities should be free for all students',
    issueArea: 'education',
    specificityLevel: 'moderate',
  },
  {
    statementText: 'Teachers should be paid based on performance metrics and student outcomes',
    issueArea: 'education',
    specificityLevel: 'moderate',
  },
  {
    statementText: 'Student loan debt should be forgiven for borrowers earning below the median income',
    issueArea: 'education',
    specificityLevel: 'specific',
  },

  // Economy/Jobs (5)
  {
    statementText: 'The federal minimum wage should be significantly increased from current levels',
    issueArea: 'economy',
    specificityLevel: 'broad',
  },
  {
    statementText: 'Reducing regulations on businesses creates more jobs and economic growth',
    issueArea: 'economy',
    specificityLevel: 'broad',
  },
  {
    statementText: 'Large corporations should pay a higher tax rate than small businesses',
    issueArea: 'economy',
    specificityLevel: 'moderate',
  },
  {
    statementText: 'Workers should have the right to form and join labor unions without employer interference',
    issueArea: 'economy',
    specificityLevel: 'moderate',
  },
  {
    statementText: 'Government should provide job training programs for workers displaced by automation',
    issueArea: 'economy',
    specificityLevel: 'specific',
  },

  // Environment/Climate (5)
  {
    statementText: 'The government should take aggressive action to combat climate change even if it increases energy costs',
    issueArea: 'environment',
    specificityLevel: 'broad',
  },
  {
    statementText: 'Environmental regulations should be reduced to allow for more economic development',
    issueArea: 'environment',
    specificityLevel: 'broad',
  },
  {
    statementText: 'The country should transition to 100% renewable energy sources within the next two decades',
    issueArea: 'environment',
    specificityLevel: 'moderate',
  },
  {
    statementText: 'Carbon emissions should be taxed to discourage pollution and fund clean energy research',
    issueArea: 'environment',
    specificityLevel: 'moderate',
  },
  {
    statementText: 'Electric vehicle purchases should be subsidized by the government to accelerate adoption',
    issueArea: 'environment',
    specificityLevel: 'specific',
  },

  // Immigration (5)
  {
    statementText: 'Immigration levels should be reduced to protect jobs for current citizens',
    issueArea: 'immigration',
    specificityLevel: 'broad',
  },
  {
    statementText: 'There should be a clear pathway to citizenship for undocumented immigrants already living in the country',
    issueArea: 'immigration',
    specificityLevel: 'broad',
  },
  {
    statementText: 'Border security funding should be significantly increased to prevent illegal crossings',
    issueArea: 'immigration',
    specificityLevel: 'moderate',
  },
  {
    statementText: 'Employers who hire undocumented workers should face serious legal penalties',
    issueArea: 'immigration',
    specificityLevel: 'moderate',
  },
  {
    statementText: 'Refugees fleeing violence and persecution should be welcomed and given legal protection',
    issueArea: 'immigration',
    specificityLevel: 'specific',
  },

  // Criminal Justice (5)
  {
    statementText: 'Police departments should receive more funding to improve public safety',
    issueArea: 'criminal_justice',
    specificityLevel: 'broad',
  },
  {
    statementText: 'The criminal justice system should focus more on rehabilitation than punishment',
    issueArea: 'criminal_justice',
    specificityLevel: 'broad',
  },
  {
    statementText: 'Cash bail should be eliminated as it discriminates against low-income defendants',
    issueArea: 'criminal_justice',
    specificityLevel: 'moderate',
  },
  {
    statementText: 'Mandatory minimum sentences should be eliminated to give judges more discretion',
    issueArea: 'criminal_justice',
    specificityLevel: 'moderate',
  },
  {
    statementText: 'Non-violent drug offenders should receive treatment instead of prison sentences',
    issueArea: 'criminal_justice',
    specificityLevel: 'specific',
  },

  // Taxes/Fiscal Policy (5)
  {
    statementText: 'Taxes on wealthy individuals should be significantly increased to fund public services',
    issueArea: 'taxes',
    specificityLevel: 'broad',
  },
  {
    statementText: 'Tax cuts for businesses lead to economic growth that benefits everyone',
    issueArea: 'taxes',
    specificityLevel: 'broad',
  },
  {
    statementText: 'The federal government should prioritize reducing the national debt over new spending programs',
    issueArea: 'taxes',
    specificityLevel: 'moderate',
  },
  {
    statementText: 'Capital gains should be taxed at the same rate as regular income',
    issueArea: 'taxes',
    specificityLevel: 'moderate',
  },
  {
    statementText: 'Social Security benefits should be expanded even if it requires higher payroll taxes',
    issueArea: 'taxes',
    specificityLevel: 'specific',
  },

  // Housing (5)
  {
    statementText: 'The government should build more public housing to address homelessness and affordability',
    issueArea: 'housing',
    specificityLevel: 'broad',
  },
  {
    statementText: 'Zoning regulations should be reduced to allow more housing construction',
    issueArea: 'housing',
    specificityLevel: 'broad',
  },
  {
    statementText: 'Rent control policies should be implemented to protect tenants from excessive increases',
    issueArea: 'housing',
    specificityLevel: 'moderate',
  },
  {
    statementText: 'First-time homebuyers should receive government assistance for down payments',
    issueArea: 'housing',
    specificityLevel: 'moderate',
  },
  {
    statementText: 'Foreign investors should be restricted from purchasing residential property',
    issueArea: 'housing',
    specificityLevel: 'specific',
  },

  // Gun Policy (5)
  {
    statementText: 'The right to own firearms should be protected with minimal government restrictions',
    issueArea: 'gun_policy',
    specificityLevel: 'broad',
  },
  {
    statementText: 'Stricter gun control laws are necessary to reduce gun violence',
    issueArea: 'gun_policy',
    specificityLevel: 'broad',
  },
  {
    statementText: 'Universal background checks should be required for all gun purchases',
    issueArea: 'gun_policy',
    specificityLevel: 'moderate',
  },
  {
    statementText: 'Assault-style weapons should be banned from civilian ownership',
    issueArea: 'gun_policy',
    specificityLevel: 'moderate',
  },
  {
    statementText: 'Red flag laws allowing temporary removal of firearms from at-risk individuals should be enacted',
    issueArea: 'gun_policy',
    specificityLevel: 'specific',
  },

  // Social Issues (5)
  {
    statementText: 'Abortion should be legal and accessible without government restrictions',
    issueArea: 'social_issues',
    specificityLevel: 'broad',
  },
  {
    statementText: 'Marriage should be defined as between one man and one woman',
    issueArea: 'social_issues',
    specificityLevel: 'broad',
  },
  {
    statementText: 'Transgender individuals should be able to use bathrooms matching their gender identity',
    issueArea: 'social_issues',
    specificityLevel: 'moderate',
  },
  {
    statementText: 'Affirmative action policies in college admissions should continue to promote diversity',
    issueArea: 'social_issues',
    specificityLevel: 'moderate',
  },
  {
    statementText: 'Social media companies should be regulated to prevent spread of misinformation',
    issueArea: 'social_issues',
    specificityLevel: 'specific',
  },
];

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing statements
  await prisma.policyStatement.deleteMany({});
  console.log('✓ Cleared existing policy statements');

  // Insert policy statements
  const created = await prisma.policyStatement.createMany({
    data: policyStatements,
  });

  console.log(`✓ Created ${created.count} policy statements`);

  // Log summary by issue area
  const summary = policyStatements.reduce((acc, stmt) => {
    acc[stmt.issueArea] = (acc[stmt.issueArea] || 0) + 1;
    return acc;
  }, {});

  console.log('\n📊 Statements by issue area:');
  Object.entries(summary).forEach(([area, count]) => {
    console.log(`   ${area}: ${count}`);
  });

  console.log('\n✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
