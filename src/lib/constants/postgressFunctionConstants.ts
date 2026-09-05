// Bucket related
export const VENUE_IMAGE_BUCKET_PATH = 'home-page-images'
export const VENUE_IMAGE_BUCKET_PREFIX = 'homepage'
export const VENUE_IMAGE_BUCKET_FORMATS = ['webp', 'jpg', 'jpeg', 'png']

export const VENUE_LOGO_BUCKET_PATH = 'venue-logo-images'


// Functions
export const FN_USER_SETTINGS_SET = 'create_venue_user'

export const FN_VENUE_BUNDLER_GET = 'get_venue_bundle'
export const FN_VENUE_GET_INDEXABLE = 'get_indexable_venues'
export const FN_VENUE_GENERAL_SETTINGS_UPDATE = 'update_venue_data'
export const FN_VENUE_GENERAL_SETTINGS_GET = 'get_pg_assets'

export const FN_VENUE_IMAGE_UPDATE = 'update_venue_images'

export const FN_VENUE_COURTS_UPDATE = 'insert_main_for_courts'
export const FN_VENUE_COURTS_GET = 'get_venue_courts';

export const FN_VENUE_BOOKING_INSERT = 'insert_booking';
export const FN_VENUE_BOOKING_GET = 'get_bookings_by_day_for_venue';
export const FN_VENUE_BOOKING_STATUS_UPDATE = 'update_booking_status_by_id';
export const FN_VENUE_SETTINGS_GET = 'get_venue_settings'
export const FN_VENUE_SETTINGS_UPDATE = 'update_venue_settings';


export const FN_BOOKING_CLOSURE_GET = 'get_booking_closure_bundle';
export const FN_BOOKING_CLOSURE_GET_OWNER_DASHBOARD = 'get_booking_closure_bundle_dashboard';

export const FN_VENUE_CLOSURES_GET = 'get_venue_closures'
export const FN_VENUE_CLOSURES_UPDATE = 'update_all_venue_court_closures'
export const FN_LOGO_URL_UPDATE = 'update_venue_logo';
export const FN_VENUE_USER_BOOKINGS_GET = 'get_user_bookings';
export const FN_VENUE_CLOSURES_DELETE = 'delete_court_closure'
export const FN_VENUE_BOOKING_LIMIT = 'past_limit_for_booking_for_user';
export const FN_VENUE_BOOKING_INSERT_WITHOUT_CHECK = 'insert_booking_without_check' // used when the db doesnt check for compatibility and just directly inserts it. but this additionally needs the user id
export const FN_VENUE_BOOKING_DELETE = 'delete_booking_by_id'
export const FN_IS_VENUE_OWNER = 'is_venue_owner'
export const FN_IS_SUPER_OWNER = 'is_super_owner'
export const FN_CREATE_SAMPLE_VENUE = 'create_sample_venue' // used to create a sample venue for testing purposes. only super owners can do this. it creates a venue, and returns the venue url and the invite token for the owner to get access the venue
export const FN_CREATE_VENUE_INVITE_URL = 'create_venue_invitation' // used to create a venue invite url for a super owner to invite a new owner to the venue. it returns the invite token that can be used to access the venue
export const FN_VENUE_INVITATION_CONSUMPTION =  'consume_venue_invitation'
export const FN_OWNER_CONTACT_US =  'insert_potential_customer'
export const FN_IS_VENUE_OWNER_OR_SUPER_OWNER = 'is_venue_owner_or_is_super_owner'
// Query params 



export const QUERY_PARAM_VENUE_URL = 'p_venue_url';
export const QUERY_PARAM_VENUE_ID = 'p_venue_id';
export const QUERY_PARAM_VENUE_GET_BUNDLE = 'p_venue_bundle';
export const QUERY_PARAM_VENUE_BOOKING_DATE_START = 'p_start_date';
export const QUERY_PARAM_VENUE_BOOKING_DATE_END = 'p_end_date';
export const QUERY_PARAM_VENUE_CLOSURE_ID = 'p_closure_id';
export const QUERY_PARAM_BOOKING_DATE = 'p_booking_date';
export const QUERY_PARAM_BOOKING_SHOW_CONFIRMATION = 'p_show_confirmation';
export const QUERY_PARAM_BOOKING_EXCEL_REQUEST = 'p_booking_date_range_excel_request';
export const QUERY_PARAM_BOOKING_CLOSURE_BUNDLE_DASHBOARD_TYPE = 'p_get_bookings_for_owner'
export const QUERY_PARAM_BOOKING_DASHBOARD_TYPE = 'p_get_bookings_for_owner'
export const FN_VENUE_BOOKING_GET_FOR_DASHBOARD = 'get_bookings_by_day_for_venue_for_dashboard'


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