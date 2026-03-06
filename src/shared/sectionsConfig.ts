/**
 * Note that config files do not follow line character  limits to avoid having to
 * manually handle line splitting when editing text. Ideally this config would be
 * handled in a cms with a nice UI, but for not I just use config files.
 *
 * I recomend toggling on your editor's word wrap for this file or it's folder if you can
 **/

import type { NavLink } from "@/components/NavBar/types";
import type { PortfolioContentProps } from "@/components/PortfolioContent/types";
import type { ResumeContentProps } from "@/components/ResumeContent/types";

export const AboutContentConfig = "I'm a software developer with a passion for data visualization and a love for finding elegant solutions to complex problems.<br/><br/>"
  + "I've been lucky enough to have spent much of my career working with non-profits and research organizations, creating tools that have the potential to help these groups improve the world we all live in. It's a very fulfilling way to spend a work day.<br/><br/>"
  + "We live in an increasingly interconnected world, and there are many opportunities to create a positive impact on the world around us. My goal for the upcoming year is to put more effort into finding these opportunities in my life. You may have noticed, but connection and impact have become a bit of a theme for this website.";

const darkhorseUrl = 'https://darkhorsevisualization.com/solutions';

export const PortfolioContentConfig: PortfolioContentProps = {
  body: `Most of my publicly accessible work has been through <a target='blank' rel='noopener' href='${darkhorseUrl}'>Darkhorse Visualization</a>.<br/><br/>`
    + `Not all of the projects I've worked on are available online, but here are some of my favourite ones that are:<br/><br/>`,
  items: [
    {
      id: 'globalOppAtlas',
      urls: ['https://global.opportunityatlas.org/'],
      titles: ['Global Opportunity Atlas'],
      text: `Visualize how a child's opportunity for upward mobility differs depending on where they were born. This is a global expansion that currently includes research from groups based in the United States, Spain, India, Brazil, and Africa.`,
      imagePaths: ['/opp-atlas-global-map.png', '/opp-atlas-global-guide.png'],
    },
    {
      id: 'wbea',
      urls: ['https://dep.wbea.org/'],
      titles: ['WBEA Forest Health Monitoring'],
      text: `See how deposition patterns change over time in the forests monitored by the Wood Buffalo Environmental Association, near Fort McMurray Alberta.`,
      imagePaths: ['/wbea-overview.png', '/wbea-map.png'],
    },
    {
      id: 'aidsvu',
      urls: ['https://map.aidsvu.org/'],
      titles: ['AIDSVu'],
      text: `Track public health indicators related to AIDS across the United States through the interactive map. You can also view detailed <a target='balnk' rel='noopener' href='https://map.aidsvu.org/profiles/nation/usa/overview'>location profiles</a> for each participating area, or you can view the new <a target='balnk' rel='noopener' href='https://map.aidsvu.org/race-profile/nation/usa/overview'>Race/Ethnicity Profile</a> to see how different demographics are disproportionately effected by HIV.`,
      imagePaths: ['/aidsvu-map.png', '/aidsvu-map-compare.png', '/aidsvu-location-profile.png', '/aidsvu-race-profile.png'],
    },
    {
      id: 'hepvu',
      urls: ['https://map.hepvu.org/'],
      titles: ['HepVu'],
      text: `Track public health indicators related to Hepatitus C across the United States. You can also view detailed <a target='balnk' rel='noopener' href='https://map.hepvu.org/profiles/nation/usa/overview'>location profiles</a> for each state. This project might look familiar if you've been reading through the list. It uses the same Vue app as AIDSVu, just with different configuration to control the branding, data, content, and reports.`,
      imagePaths: ['/hepvu-map.png', '/hepvu-location-profile.png'],
    },
    {
      id: 'lumina',
      urls: ['https://strongernation.luminafoundation.org/'],
      titles: ['Lumina Foundation - A Stronger Nation'],
      text: `Track national progress towards increasing credentials of value attainment to 75% of adults in the U.S. labour force by 2040. This percentage is defined as "The share of the U.S. labor force with a post-high school credential AND earning a salary/wage 15% more than the national median for a high school graduate". See the <a target='balnk' rel='noopener' href='https://strongernation.luminafoundation.org/methodology'>methodoly page</a> for more.`,
      imagePaths: ['/lumina-cov.png', '/lumina-cov-states.png', '/lumina-ea.png', '/lumina-ea-swarm.png', '/lumina-methodology.png'],
    },
    // TODO: Get screenshots and text for these
    // {
    //   id: 'oppAtlas',
    //   urls: ['https://www.opportunityatlas.org/'],
    //   titles: ['The Opportunity Atlas - Mobility Trends Update'],
    //   text: ``,
    // },
    // {
    //   id: 'edf',
    //   urls: ['https://map.climatevulnerabilityindex.org/'],
    //   titles: ['The U.S. Climate Vulnerability Index'],
    //   text: ``,
    // },
  ]
};

export const ResumeContentConfig: ResumeContentProps = {
  leadingText: `If you want specifics on my experience and career in software development, here's my resume!`,
  tldrHeader: `And here's a quick summary if that's what you're looking for`,
  tldrText: `<div><strong>Years of Experience</strong>: 5.5</div>`
    + `<div><strong>Programming Languages and Frameworks</strong>:<br/>`
    + `<ul><li>JavaScript, TypeScript, Vue, Nuxt, VitePress, Angular, React, and Node.js</li><li>C#, ASP.Net, .Net Core, and Xamarin</li><li>CSS, Tailwind CSS, PostCSS, and SCSS</li><li>SQL, PostgreSQL, MySQL, and SQLite</li><li>HTML and XML | Java | Kotlin | MatLab | Python and Flask | C and C++ | R and R Studio</li></ul></div>`
    + `<div><strong>Devops, Tools, and Platforms</strong>:<br/>`
    + `<ul><li>AWS, S3, DynamoDB, CloudFront, and Lambda</li><li>Azure DevOps, Boards, Pipelines, Repos, Monitor, Blob Storage, Data Lake, and Functions</li><li>CircleCI | Git and GitHub | Mapbox | QGIS</li></ul></div>`,
};

export const NavLinks: NavLink[] = [
  {
    id: 'about',
    label: 'About',
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
  },
  {
    id: 'resume',
    label: 'Resume',
  },
  // hide settings for now, it's still under constructions
  {
    id: 'settings',
    label: '',
    title: 'Settings'
  }
] as const;

export const FramesPerSecondInfo = `The maximum frames per second for the animated background. The actual frames per second may be lower depending on your system's current resource availability.`;

export const MinTimeToCrossInfo = `The time it takes a star travelling at max speed to cross the screen. This allows the default setting to create similar feeling motion across many different screen sizes and resolutions.`;

export const ConnectionDistanceInfo = `The maximum distance between connected stars as a percentage of the width or height of the screen, whichever is smallest. This allows the default setting to create similar feeling connection density across many different screen sizes and resolutions.`;

export const ConnectionDistanceWarning = `Warning: Increasing this value can cause performance to degrade.`;
