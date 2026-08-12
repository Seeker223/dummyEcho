# Emergency Echo — Old UI Partnership + Marketplace Update

This build keeps the existing Emergency Echo workflow UI and adds the Partnership and Marketplace workflow pages without applying the separate redesign/dummy-site visual system.

## Partnership pages

- `/app/partnership` — partnership dashboard overview
- `/app/partnership-programs` — programs
- `/app/partnership-proposal` — multi-step proposal flow
- `/app/partnership-directory` — verified partner directory/search
- `/app/partnership-analytics` — performance and impact analytics
- `/app/partnership-agreement` — agreement details/status

## Marketplace pages

- `/app/marketplace` — marketplace overview
- `/app/marketplace-categories` — categories
- `/app/marketplace-products` — product listing/search/filter
- `/app/marketplace-product` — product details
- `/app/marketplace-vendor` — vendor store
- `/app/marketplace-checkout` — checkout
- `/app/marketplace-sell` — vendor application

The pages use the existing React + styled-components workflow architecture, theme tokens, navigation, authentication guards, and `/app/:pageId` routing.

These are frontend workflow/dummy interactions only. Payment, inventory, fulfillment, vendor verification, and partnership backend persistence remain separate integration work.
