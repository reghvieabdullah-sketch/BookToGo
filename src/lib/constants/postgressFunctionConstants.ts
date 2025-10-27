// ==========================
// Bucket related
// ==========================
export const VENUE_IMAGE_BUCKET_PATH    = 'home-page-images';
export const VENUE_IMAGE_BUCKET_PREFIX  = 'homepage';
export const VENUE_IMAGE_BUCKET_FORMATS = ['webp', 'jpg', 'jpeg'];


// ==========================
// Functions
// ==========================

// --- User ---
export const FN_USER_SETTINGS_SET = 'create_venue_user';

// --- Venue general ---
export const FN_VENUE_SETTINGS_GET            = 'get_venue_settings';
export const FN_VENUE_SETTINGS_UPDATE         = 'update_venue_settings';
export const FN_VENUE_GENERAL_SETTINGS_GET    = 'get_pg_assets';
export const FN_VENUE_GENERAL_SETTINGS_UPDATE = 'update_venue_data';

// --- Venue images ---
export const FN_VENUE_IMAGE_UPDATE = 'update_venue_images';

// --- Venue courts ---
export const FN_VENUE_COURTS_GET    = 'get_venue_courts';
export const FN_VENUE_COURTS_UPDATE = 'insert_main_for_courts';

// --- Venue bookings ---
export const FN_VENUE_BOOKING_GET                  = 'get_bookings_by_day_for_venue';
export const FN_VENUE_BOOKING_INSERT               = 'insert_booking';
export const FN_VENUE_BOOKING_LIMIT                = 'past_limit_for_booking_for_user';
export const FN_VENUE_BOOKING_GET_FOR_DASHBOARD    = 'get_bookings_by_day_for_venue_for_dashboard';
export const FN_VENUE_BOOKING_INSERT_WITHOUT_CHECK = 'insert_booking_without_check'; // direct insert, needs user id

// --- Venue closures ---
export const FN_VENUE_CLOSURES_GET       = 'get_venue_closures';
export const FN_BOOKING_CLOSURE_GET      = 'get_booking_closure_bundle';
export const FN_VENUE_CLOSURES_UPDATE    = 'update_all_venue_court_closures';
export const FN_VENUE_CLOSURES_DELETE    = 'delete_court_closure';
export const FN_VENUE_USER_BOOKINGS_GET  = 'get_user_bookings';


// ==========================
// Query params
// ==========================
export const QUERY_PARAM_VENUE_URL                = 'p_venue_url';
export const QUERY_PARAM_VENUE_ID                 = 'p_venue_id';
export const QUERY_PARAM_BOOKING_DATE             = 'p_booking_date';
export const QUERY_PARAM_VENUE_GET_BUNDLE         = 'p_venue_bundle';
export const QUERY_PARAM_VENUE_CLOSURE_ID         = 'p_closure_id';
export const QUERY_PARAM_VENUE_BOOKING_DATE_END   = 'p_end_date';
export const QUERY_PARAM_BOOKING_DASHBOARD_TYPE   = 'p_get_bookings_for_owner';
export const QUERY_PARAM_VENUE_BOOKING_DATE_START = 'p_start_date';


// ==========================
// Misc
// ==========================
export const INVALIDATE_PARENT_LAYOUT_CODE = 'layout:parent';

export enum recurrenceEnum {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    YEARLY = 'yearly',
    ONCE = 'once',
    NOT_REGULAR = 'not regular',
}

export enum courtStatusEnum {
    APPROVED = 'approved',
    ARCHIVED = 'archived',
    PENDING = 'pending',
    TEMPORARY = 'temporary'
}