# Configuration Guide

This folder contains all the configuration files for the portfolio site. Edit these files to customize the site for your own use.

## Files

### `site.config.ts`
Contains site-wide settings:
- Domain name
- Username and personal info
- Birth date (for age calculation)
- Location, role, status
- Social media links
- System version

### `projects.config.ts`
Defines all projects displayed on the site:
- Project name, description, status
- Tags and icons
- Links and repositories
- Status colors
- Visibility (public/private)
- Category (production/thesis/personal/open-source/commercial/academic)

**To add a project:**
1. Add a new object to the `projects` array
2. Fill in all required fields including `visibility` and `category`
3. The project will automatically appear on the home page and projects page

**Visibility options:**
- `public` - Publicly accessible project
- `private` - Private/internal project

**Category options:**
- `production` - Production/live project
- `thesis` - Academic thesis project
- `personal` - Personal project
- `open-source` - Open source project
- `commercial` - Commercial/client project
- `academic` - Academic/research project

### `content.config.ts`
Contains all text content for the site:
- Home page hero text
- About page bio and skills
- Timeline events
- Project page content

### `skills.config.ts`
Defines all skills with scores (0-100) for the radar chart:
- Skill name, score, and category
- Automatically displays top 6 skills in hexagon radar chart
- Scores are used to calculate the radar chart visualization

**To add/modify skills:**
1. Add or edit entries in the `skills` array
2. Set `score` from 0-100 (percentage)
3. The radar chart will automatically show the top 6 skills by score

### `education.config.ts`
Defines education history:
- Institution name, degree, field of study
- Start and end dates
- Location and description
- Icons for visual representation

**To add education:**
1. Add a new object to the `education` array
2. Fill in institution, degree, dates, etc.
3. Education will appear on the about page

### `certifications.config.ts`
Defines professional certifications:
- Certification name and issuer
- Issue and expiry dates
- Credential ID and verification URL
- Description and icons

**To add certifications:**
1. Add a new object to the `certifications` array
2. Fill in name, issuer, dates, credential info
3. Certifications will appear on the about page

## Usage

All configs are exported from `index.ts`:

```typescript
import { siteConfig, projects, contentConfig, skills, getTopSkills, education, certifications } from '@/config';
```

## Customization

1. **Change domain/username**: Edit `site.config.ts`
2. **Add projects**: Add entries to `projects.config.ts`
3. **Update bio**: Edit `content.config.ts`
4. **Change birth date**: Update `site.config.ts` (affects age calculation)
5. **Modify skills**: Edit `skills.config.ts` - set scores (0-100) for each skill
6. **Add education**: Edit `education.config.ts` - add your educational background
7. **Add certifications**: Edit `certifications.config.ts` - add professional certifications
6. **Add education**: Edit `education.config.ts` - add your educational background
7. **Add certifications**: Edit `certifications.config.ts` - add professional certifications
8. **Choose own color theme**: Edit the color scheme in `colors.css` (from greenish hacker mode to pink anime portfolio etc...), The important thing is that the color scheme has to fit (you can't put light green on yellow...)

## Notes

- All dates use JavaScript Date format (month is 0-indexed: 0 = January, 11 = December)
- Project status colors: 'green', 'yellow', 'blue', 'orange', 'red'
- Icons use Material Symbols Outlined names
- Changes require a rebuild/restart of the Next.js dev server

