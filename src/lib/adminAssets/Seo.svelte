<script>
    export let title;
    export let description;
    export let url;
    export let image;
    export let type = 'website';
    export let noindex = false;
    export let ldJson = null;
</script>

<svelte:head>
    <title>{title}</title>

    <meta name="description" content={description} />
    <link rel="canonical" href={url} />

    {#if noindex}
        <meta name="robots" content="noindex, nofollow" />
    {:else}
        <meta name="robots" content="index, follow" />
    {/if}

    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={url} />
    <meta property="og:type" content={type} />

    {#if image}
        <meta property="og:image" content={image} />
    {/if}


    {#if ldJson}
        {#if Array.isArray(ldJson)}
            {#each ldJson as schema}
                {@html `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`}
            {/each}
        {:else}
            {@html `<script type="application/ld+json">${JSON.stringify(ldJson).replace(/</g, '\\u003c')}</script>`}
        {/if}
    {/if}
</svelte:head>
