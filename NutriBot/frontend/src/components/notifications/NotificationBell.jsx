import {
  useEffect,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";

import {
  Bell,
  CheckCheck,
  X,
} from "lucide-react";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../services/notificationService";

import "./NotificationBell.css";


/* =========================================================
   TIME FORMATTER
========================================================= */

function formatNotificationTime(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);
  const now = new Date();

  const diff =
    now.getTime() - date.getTime();

  if (diff < 60 * 1000) {
    return "Just now";
  }

  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(
      diff / (60 * 1000)
    )}m ago`;
  }

  if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(
      diff / (60 * 60 * 1000)
    )}h ago`;
  }

  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return `${Math.floor(
      diff / (24 * 60 * 60 * 1000)
    )}d ago`;
  }

  return date.toLocaleDateString();
}


/* =========================================================
   COMPONENT
========================================================= */

function NotificationBell() {

  const [isOpen, setIsOpen] = useState(false);

  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [loading, setLoading] =
    useState(false);

  const [panelPosition, setPanelPosition] =
    useState({
      left: 0,
      bottom: 0,
    });


  /*
   * The wrapper contains the bell.
   */
  const wrapperRef = useRef(null);

  /*
   * The popup is rendered into document.body,
   * so it needs its own ref.
   */
  const panelRef = useRef(null);


  /* =======================================================
     LOAD NOTIFICATIONS
  ======================================================= */

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const [
        notificationData,
        countData,
      ] = await Promise.all([
        getNotifications(),
        getUnreadNotificationCount(),
      ]);

      setNotifications(
        Array.isArray(notificationData)
          ? notificationData
          : []
      );

      setUnreadCount(
        Number(
          countData?.unread_count || 0
        )
      );

    } catch (error) {

      console.error(
        "Load notifications error:",
        error
      );

    } finally {
      setLoading(false);
    }
  };


  /* =======================================================
     INITIAL LOAD + AUTO REFRESH
  ======================================================= */

  useEffect(() => {

    let isMounted = true;

    const runNotificationLoad =
      async () => {

        if (!isMounted) {
          return;
        }

        await loadNotifications();
      };


    const initialTimer =
      setTimeout(() => {
        runNotificationLoad();
      }, 0);


    const interval =
      setInterval(() => {
        runNotificationLoad();
      }, 30000);


    return () => {

      isMounted = false;

      clearTimeout(initialTimer);

      clearInterval(interval);
    };

  }, []);


  /* =======================================================
     CALCULATE POPUP POSITION
  ======================================================= */

  const updatePanelPosition = () => {

    const wrapper =
      wrapperRef.current;

    if (!wrapper) {
      return;
    }


    const rect =
      wrapper.getBoundingClientRect();


    /*
     * Notification panel dimensions.
     *
     * These match the CSS below.
     */

    const panelWidth = 390;

    const viewportPadding = 12;

    const gap = 12;


    /*
     * Normally the popup opens to the
     * RIGHT of the sidebar notification.
     */

    let left =
      rect.right + gap;


    /*
     * Prevent the popup from running
     * outside the right side of the screen.
     */

    if (
      left + panelWidth >
      window.innerWidth -
        viewportPadding
    ) {

      left =
        window.innerWidth -
        panelWidth -
        viewportPadding;
    }


    /*
     * Never allow the panel to go
     * outside the left side either.
     */

    if (left < viewportPadding) {
      left = viewportPadding;
    }


    /*
     * The notification is near the
     * bottom of the sidebar.
     *
     * Therefore the popup opens upward.
     *
     * Using bottom instead of top keeps
     * it visible even if the page changes.
     */

    const bottom =
      window.innerHeight -
      rect.top +
      gap;


    setPanelPosition({
      left,
      bottom,
    });
  };


  /* =======================================================
     UPDATE POSITION WHEN OPEN
  ======================================================= */

  useEffect(() => {

    if (!isOpen) {
      return;
    }


    updatePanelPosition();


    const handlePositionUpdate =
      () => {
        updatePanelPosition();
      };


    window.addEventListener(
      "resize",
      handlePositionUpdate
    );

    window.addEventListener(
      "scroll",
      handlePositionUpdate,
      true
    );


    return () => {

      window.removeEventListener(
        "resize",
        handlePositionUpdate
      );

      window.removeEventListener(
        "scroll",
        handlePositionUpdate,
        true
      );
    };

  }, [isOpen]);


  /* =======================================================
     CLOSE WHEN CLICKING OUTSIDE
  ======================================================= */

  useEffect(() => {

    if (!isOpen) {
      return;
    }


    const handleOutsideClick =
      (event) => {

        const clickedInsideBell =
          wrapperRef.current?.contains(
            event.target
          );

        const clickedInsidePanel =
          panelRef.current?.contains(
            event.target
          );


        if (
          !clickedInsideBell &&
          !clickedInsidePanel
        ) {
          setIsOpen(false);
        }
      };


    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };

  }, [isOpen]);


  /* =======================================================
     TOGGLE
  ======================================================= */

  const handleToggle = async () => {

    const nextOpen =
      !isOpen;


    setIsOpen(nextOpen);


    if (nextOpen) {

      await loadNotifications();

      /*
       * Wait until the browser has
       * processed the state update.
       */

      requestAnimationFrame(() => {
        updatePanelPosition();
      });
    }
  };


  /* =======================================================
     MARK ONE AS READ
  ======================================================= */

  const handleMarkAsRead = async (
    notificationId
  ) => {

    try {

      await markNotificationAsRead(
        notificationId
      );


      setNotifications(
        (current) =>
          current.map(
            (notification) =>
              notification.id ===
              notificationId
                ? {
                    ...notification,
                    is_read: 1,
                  }
                : notification
          )
      );


      setUnreadCount(
        (current) =>
          Math.max(
            0,
            current - 1
          )
      );

    } catch (error) {

      console.error(
        "Mark notification as read error:",
        error
      );
    }
  };


  /* =======================================================
     MARK ALL AS READ
  ======================================================= */

  const handleMarkAllAsRead =
    async () => {

      if (unreadCount === 0) {
        return;
      }


      try {

        await markAllNotificationsAsRead();


        setNotifications(
          (current) =>
            current.map(
              (notification) => ({
                ...notification,
                is_read: 1,
              })
            )
        );


        setUnreadCount(0);

      } catch (error) {

        console.error(
          "Mark all notifications as read error:",
          error
        );
      }
    };


  /* =======================================================
     NOTIFICATION PANEL
  ======================================================= */

  const notificationPanel = (
    <div
      ref={panelRef}
      className="notification-panel"
      style={{
        left: `${panelPosition.left}px`,
        bottom: `${panelPosition.bottom}px`,
      }}
    >

      {/* HEADER */}

      <div className="notification-panel-header">

        <div>

          <h3>
            Notifications
          </h3>

          <span>
            {unreadCount > 0
              ? `${unreadCount} unread`
              : "You're all caught up"}
          </span>

        </div>


        <button
          type="button"
          className="notification-close"
          onClick={() =>
            setIsOpen(false)
          }
          aria-label="Close notifications"
        >
          <X size={17} />
        </button>

      </div>


      {/* MARK ALL */}

      {unreadCount > 0 && (
        <button
          type="button"
          className="mark-all-read"
          onClick={
            handleMarkAllAsRead
          }
        >
          <CheckCheck size={15} />

          Mark all as read
        </button>
      )}


      {/* LIST */}

      <div className="notification-list">

        {loading ? (

          <div className="notification-empty">

            <Bell size={28} />

            <strong>
              Loading notifications...
            </strong>

          </div>

        ) : notifications.length === 0 ? (

          <div className="notification-empty">

            <Bell size={28} />

            <strong>
              No notifications
            </strong>

            <span>
              New updates will appear here.
            </span>

          </div>

        ) : (

          notifications.map(
            (notification) => {

              const isUnread =
                !notification.is_read;


              return (
                <button
                  type="button"
                  key={notification.id}
                  className={`notification-item ${
                    isUnread
                      ? "unread"
                      : ""
                  }`}
                  onClick={() =>
                    isUnread &&
                    handleMarkAsRead(
                      notification.id
                    )
                  }
                >

                  <div className="notification-item-dot" />


                  <div className="notification-item-content">

                    <div className="notification-item-top">

                      <strong>
                        {notification.title}
                      </strong>

                      <span>
                        {formatNotificationTime(
                          notification.created_at
                        )}
                      </span>

                    </div>


                    <p>
                      {notification.message}
                    </p>


                    {notification.notification_type && (
                      <small>
                        {notification.notification_type.replaceAll(
                          "_",
                          " "
                        )}
                      </small>
                    )}

                  </div>

                </button>
              );
            }
          )

        )}

      </div>

    </div>
  );


  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <>

      <div
        className="notification-wrapper"
        ref={wrapperRef}
      >

        <button
          type="button"
          className="notification-bell"
          onClick={handleToggle}
          aria-label="Notifications"
          aria-expanded={isOpen}
        >

          <Bell
            size={20}
            strokeWidth={1.9}
          />


          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 99
                ? "99+"
                : unreadCount}
            </span>
          )}

        </button>

      </div>


      {isOpen &&
        createPortal(
          notificationPanel,
          document.body
        )}

    </>
  );
}


export default NotificationBell;
