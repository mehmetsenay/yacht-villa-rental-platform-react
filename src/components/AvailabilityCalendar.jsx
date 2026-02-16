import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const AvailabilityCalendar = ({ basePrice = 7059, bookedDates = [], onClose, onApply }) => {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 1)); // Started Feb 2026 as per screenshot
    const [selectedRange, setSelectedRange] = useState({ start: null, end: null });
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const months = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];

    const daysShort = ['P', 'S', 'Ç', 'P', 'C', 'C', 'P'];

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => {
        const day = new Date(year, month, 1).getDay();
        // Adjust for Monday start: 0=Sun needs to become 6, 1=Mon needs to become 0
        return day === 0 ? 6 : day - 1;
    };

    const generateMonthData = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const startDay = getFirstDayOfMonth(year, month);
        const days = [];

        // Empty slots for previous month
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }

        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        return { name: `${months[month]} ${year}`, days };
    };

    const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
    const leftMonth = generateMonthData(currentDate);
    const rightMonth = generateMonthData(nextMonthDate);

    const formatPrice = (price) => {
        if (isMobile) return (price / 1000).toFixed(1) + 'k'; // Compact price for mobile
        return price.toLocaleString('tr-TR', { maximumFractionDigits: 0 }) + ' ₺';
    };

    // Mock logic to determine if a date is "Opsiyonlu" or "Dolu"
    const getDayStatus = (date) => {
        if (!date) return 'empty';
        const day = date.getDate();
        // deterministic mock pattern
        const isBooked = bookedDates.includes(date.toISOString().split('T')[0]);
        if (isBooked) return 'booked';

        // Check selection
        if (selectedRange.start && selectedRange.end) {
            if (date >= selectedRange.start && date <= selectedRange.end) return 'range';
        } else if (selectedRange.start && date.getTime() === selectedRange.start.getTime()) {
            return 'selected';
        }

        return 'available';
    };

    const handleDayClick = (date) => {
        if (!date) return;

        // Simple range selection logic
        if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
            setSelectedRange({ start: date, end: null });
        } else {
            if (date < selectedRange.start) {
                setSelectedRange({ start: date, end: selectedRange.start });
            } else {
                setSelectedRange({ ...selectedRange, end: date });
            }
        }
    };

    const changeMonth = (offset) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset));
    };

    const handleApply = () => {
        if (onApply) onApply(selectedRange);
    };

    const renderMonth = (monthData) => (
        <div className="month-container">
            <h3 className="month-title">{monthData.name}</h3>
            <div className="weekdays-row">
                {daysShort.map((d, i) => <div key={i} className="weekday">{d}</div>)}
            </div>
            <div className="days-grid">
                {monthData.days.map((date, i) => {
                    if (!date) return <div key={i} className="day-cell empty"></div>;

                    const status = getDayStatus(date);
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    const dailyPrice = isWeekend ? basePrice * 1.2 : basePrice; // Weekend pricing mock

                    return (
                        <div
                            key={i}
                            className={`day-cell ${status}`}
                            onClick={() => handleDayClick(date)}
                        >
                            <span className="day-number">{date.getDate()}</span>
                            <span className="day-price">{formatPrice(dailyPrice)}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="calendar-wrapper">
            {isMobile && (
                <button className="mobile-close-btn" onClick={onClose}>
                    <X size={24} />
                </button>
            )}

            <div className="calendar-header">
                <button className="nav-btn" onClick={() => changeMonth(-1)}><ChevronLeft /></button>
                <button className="nav-btn" onClick={() => changeMonth(1)}><ChevronRight /></button>
            </div>

            <div className="months-flex">
                {renderMonth(leftMonth)}
                {!isMobile && renderMonth(rightMonth)}
            </div>

            <div className="calendar-legend">
                <div className="legend-item"><span className="dot booked"></span> Dolu</div>
                <div className="legend-item"><span className="dot option"></span> Opsiyonlu</div>
                <div className="legend-item"><span className="dot available"></span> Uygun</div>
                <button className="clear-btn" onClick={() => setSelectedRange({ start: null, end: null })}>Temizle</button>
            </div>

            {/* Footer Buttons for Modal */}
            <div className="calendar-footer">
                <button className="btn-text" onClick={onClose}>Vazgeç</button>
                <button className="btn-apply" onClick={handleApply}>Kaydet</button>
            </div>

            <style>{`
        .calendar-wrapper {
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
            max-width: 900px;
            margin: 0 auto;
            border: 1px solid #eee;
            position: relative;
        }

        .calendar-header {
            display: flex;
            justify-content: space-between;
            position: absolute;
            width: 100%;
            left: 0;
            top: 25px;
            padding: 0 40px;
            pointer-events: none;
        }

        .nav-btn {
            pointer-events: auto;
            background: white;
            border: 1px solid #eee;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            z-index: 10;
        }
        .nav-btn:hover { background: #f5f5f5; }

        .months-flex {
            display: flex;
            gap: 40px;
            justify-content: center;
        }

        .month-container {
            flex: 1;
        }

        .month-title {
            text-align: center;
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 20px;
            color: #1d1d1f;
        }

        .weekdays-row {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            margin-bottom: 10px;
            text-align: center;
        }

        .weekday {
            color: #999;
            font-size: 0.9rem;
            font-weight: 500;
        }

        .days-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 8px;
        }

        .day-cell {
            aspect-ratio: 1;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            border: 1px solid transparent; /* Prevent layout shift */
        }

        .day-cell.available {
            background-color: #d8f3f8; /* Light teal from image */
            color: #0b6e79;
        }

        .day-cell.available:hover {
            background-color: #bcecf4;
        }

        .day-cell.range, .day-cell.selected {
            background-color: #0b6e79;
            color: white;
        }
        
        .day-cell.range .day-price, .day-cell.selected .day-price {
            color: rgba(255,255,255,0.8);
        }

        .day-cell.booked {
            background-color: #f0f0f0;
            color: #ccc;
            cursor: not-allowed;
            pointer-events: none;
        }
        .day-cell.booked .day-price { display: none; }

        .day-number {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 2px;
        }

        .day-price {
            font-size: 0.65rem;
            font-weight: 500;
        }

        .calendar-legend {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #f0f0f0;
            font-size: 0.95rem;
        }

        .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #1d1d1f;
        }

        .dot {
            width: 16px;
            height: 16px;
            border-radius: 4px;
        }

        .dot.booked { background: #e0e0e0; }
        .dot.option { background: #fee2c5; } /* Orange-ish from image */
        .dot.available { background: #d8f3f8; }

        .clear-btn {
            margin-left: auto;
            background: none;
            border: none;
            color: #0b6e79;
            font-weight: 600;
            cursor: pointer;
            text-decoration: underline;
        }

        .calendar-footer {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            margin-top: 24px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }

        .btn-text {
            background: none;
            border: none;
            padding: 8px 16px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: underline;
        }

        .btn-apply {
            background: #1d1d1f;
            color: white;
            border: none;
            padding: 10px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
        }
        
        .mobile-close-btn {
            display: none;
        }

        @media (max-width: 768px) {
            .calendar-wrapper {
                padding: 20px;
                max-width: 100%;
                border: none;
                box-shadow: none;
                height: 100%;
                display: flex;
                flex-direction: column;
            }
            
            .mobile-close-btn {
                display: flex;
                position: absolute;
                top: 15px;
                right: 15px;
                background: #f5f5f5;
                border: none;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                align-items: center;
                justify-content: center;
                color: #1d1d1f;
                z-index: 20;
            }

            .months-flex {
                flex-direction: column;
                gap: 20px;
                margin-top: 40px; /* Space for header/close btn */
            }

            .calendar-header {
                position: absolute;
                top: 20px;
                padding: 0 20px;
                margin-bottom: 0;
                pointer-events: auto;
                justify-content: space-between;
                width: 100%;
                z-index: 10;
            }
            
            /* Center the month title more on mobile */
            .month-title {
                margin-bottom: 25px;
            }

            .nav-btn {
                width: 36px;
                height: 36px;
            }

            .days-grid {
                gap: 6px; 
            }

            .day-number {
                font-size: 0.9rem;
            }

            .day-price {
                font-size: 0.6rem;
            }
            
            .day-cell {
                border-radius: 8px;
            }
            
            .calendar-legend {
                flex-wrap: wrap;
                gap: 12px;
                margin-top: auto; /* Push to bottom */
                padding-top: 20px;
                padding-bottom: 80px; /* Space for fixed footer */
                font-size: 0.85rem;
            }
            
            .clear-btn {
                width: 100%;
                text-align: center;
                margin-top: 15px;
                padding: 10px;
                background: #f9f9f9;
                border-radius: 8px;
            }
            
            .calendar-footer {
                position: fixed;
                bottom: 0;
                left: 0;
                width: 100%;
                background: white;
                padding: 16px 20px;
                border-top: 1px solid #eee;
                z-index: 100;
                box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
                display: flex;
                justify-content: space-between;
            }
            
            .btn-apply {
                 flex: 1; 
                 margin-left: 12px;
                 padding: 14px;
                 font-size: 1rem;
            }
            .btn-text {
                 padding: 14px;
                 font-size: 1rem;
            }
        }
      `}</style>
        </div>
    );
};

export default AvailabilityCalendar;
