# Azure Container Apps

The template deploys one Consumption environment and one public container app.
It allocates 0.25 vCPU and 0.5 GiB RAM, scales between zero and one replica,
redirects HTTP to HTTPS, and checks `/healthz` for startup, readiness and liveness.
Single revision mode sends traffic to the latest ready revision.

No database, Azure Container Registry, Log Analytics workspace, custom domain,
or dedicated compute is created. Historical log storage is disabled; live console
logs are still available. Monthly free allowances are shared across the Azure
subscription. Scaling to zero and limiting replicas do not impose a spending cap.
Revisions may temporarily overlap during updates. Set a budget alert in Azure
Cost Management before deploying; alerts do not stop spending.

## 1. Build and test locally

Start Docker Desktop in Linux container mode. From the repository root:

```powershell
docker build --platform linux/amd64 -t portfolio:local .
docker run --rm --name portfolio-local -p 127.0.0.1:8080:8080 portfolio:local
```

The build runs the frontend checks/tests, Go tests and `go vet`. The runtime
contains the static Go executable, embedded website/content and CA certificates,
and runs as an unprivileged numeric user. It needs no writable application files.
`PORTFOLIO_ADDR=0.0.0.0:8080` is set in the image and in the Azure template;
local development outside Docker keeps its existing loopback default.

In another terminal, check the server:

```powershell
Invoke-RestMethod http://127.0.0.1:8080/healthz
Invoke-RestMethod http://127.0.0.1:8080/api/v1/profile
```

Open http://127.0.0.1:8080 and check navigation, images and direct URLs such as
`/experience`, `/certifications`, and `/projects/<an-existing-slug>`.
Press Ctrl+C in the container terminal to stop it.

## 2. Publish an image

Use a registry you control that allows anonymous image pulls, such as a public
Docker Hub repository. The template deliberately contains no registry credentials.
Publishing an image makes its embedded portfolio content publicly downloadable.
Do not include private content or secrets in the image.

Create the public repository first, then replace the account below. Use a fresh
tag for every release so updates don't reuse a cached image.

```powershell
$registryAccount = 'YOUR_DOCKER_HUB_ACCOUNT'
$release = Get-Date -Format 'yyyyMMddHHmmss'
$image = "docker.io/${registryAccount}/portfolio:${release}"
docker login
docker tag portfolio:local $image
docker push $image
docker buildx imagetools inspect $image
```

Copy the digest from the inspection output and use an immutable image reference
for Azure, for example:

```powershell
$image = "docker.io/${registryAccount}/portfolio@sha256:REPLACE_WITH_DIGEST"
```

A private registry needs authentication or managed identity configuration before
this template can pull its images. The Azure commands below do not build or push
an image, and do not create a registry.

## 3. Sign in and preview the Azure deployment

Install [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli-windows)
and open a new terminal. These commands require an active subscription and
permission to create resources. Replace the subscription ID with your intended
subscription. Run commands individually and stop if any command fails.

```powershell
az login
az account list --output table
az account set --subscription 'YOUR_SUBSCRIPTION_ID'
az account show --query '{name:name,id:id}' --output table
az bicep install
az bicep build --file infra/main.bicep --stdout > $null
az provider register --namespace Microsoft.App --wait
az provider register --namespace Microsoft.OperationalInsights --wait

$resourceGroup = 'portfolio-rg'
$location = 'uksouth'
az group create --name $resourceGroup --location $location
az deployment group what-if --resource-group $resourceGroup --template-file infra/main.bicep --parameters containerImage=$image
```

Choose a region available to your subscription; UK South is a starting choice.
Registering the OperationalInsights provider does not create a logging workspace.
`what-if` previews changes; it does not deploy the template. The resource group
creation before it does create an empty group.

## 4. Deploy and verify

Only run this when ready to create Azure resources and publish the site:

```powershell
az deployment group create --name portfolio --resource-group $resourceGroup --template-file infra/main.bicep --parameters containerImage=$image
$websiteUrl = az deployment group show --name portfolio --resource-group $resourceGroup --query properties.outputs.websiteUrl.value --output tsv
Invoke-RestMethod "$websiteUrl/healthz"
Invoke-RestMethod "$websiteUrl/api/v1/profile"
```

Open the returned HTTPS address and repeat the browser checks from step 1.
The first request after scaling to zero can be slow. Run the same deployment
command with a newly built image digest to release future updates.

For live logs, install the Container Apps CLI extension if prompted and run:

```powershell
az containerapp logs show --name portfolio --resource-group $resourceGroup --follow
```

## References

- [Container Apps billing](https://learn.microsoft.com/azure/container-apps/billing)
- [Container Apps scaling](https://learn.microsoft.com/azure/container-apps/scale-app)
- [Azure budget alerts](https://learn.microsoft.com/azure/cost-management-billing/costs/tutorial-acm-create-budgets)
