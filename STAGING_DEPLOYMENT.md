# Celsior Staging Deployment

## Staging URL

https://dev.celsiortech.com/

## Source of truth

GitHub repository:

https://github.com/Celsior-Marketing/celsior-new-website

Branch:

main

## Deployment model

Staging deployment is handled through GitHub Actions.

Workflow:

Deploy to cPanel Staging

Trigger:

Manual only through GitHub Actions.

## Standard process

1. Developer makes changes in a branch.
2. Changes are reviewed and merged into main.
3. Approved user goes to GitHub Actions.
4. Run "Deploy to cPanel Staging" on branch main.
5. Verify https://dev.celsiortech.com/.

## Access rules

Developers should not receive WHM access.

Developers should not receive production cPanel access.

Developers should normally work through GitHub only.

The staging deployment uses a restricted FTP account for dev.celsiortech.com.

## Important limitation

The current staging deploy uploads and overwrites files, but does not delete old files from the cPanel staging folder.

If a file is removed from GitHub and must also be removed from staging, remove it carefully from staging after confirming the exact file path.

## Production

This workflow does not deploy production.

Production deployment must be handled separately and only after explicit approval.
