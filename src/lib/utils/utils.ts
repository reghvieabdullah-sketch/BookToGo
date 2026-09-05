export function getStatusBadgeClass(status?: string) {
    switch (status && status.toLowerCase()) {
        case 'paid':
            return 'badge-success';
        case 'unpaid':
            return 'badge-warning';
        case 'upcoming':
            return 'badge-info';
        case 'past':
            return 'badge-neutral';
    }
}


export function getPaymentStatusBadgeClass(status: string) {
    switch (status.toLowerCase()) {
        case 'paid':
            return 'badge-success';
        case 'pending':
            return 'badge-warning';
        case 'refunded':
            return 'badge-info';
        default:
            return 'badge-neutral';
    }
}