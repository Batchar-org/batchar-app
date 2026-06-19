import { useEffect, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '@/constants/theme';

interface AuctionPeriodPickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

// Date strip layout constants
const CELL_W = 64;
const CELL_GAP = 8;
const CIRCLE = 44;
const LABEL_LINE_H = 16;
const CELL_PAD_V = 4;
const PILL_TOP = CELL_PAD_V + LABEL_LINE_H + 4;
const TOTAL_DAYS = 7;

function buildDays(today: Date): Date[] {
  return Array.from({ length: TOTAL_DAYS }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function combineDateTime(date: Date, time: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    time.getHours(),
    time.getMinutes(),
    0,
    0
  );
}

function formatPeriodRange(today: Date, endDate: Date): string {
  const startDay = today.getDate();
  const endDay = endDate.getDate();
  const startMonth = today.getMonth() + 1;
  const endMonth = endDate.getMonth() + 1;
  if (startMonth === endMonth) return `${startMonth}월 ${startDay}일~${endDay}일`;
  return `${startMonth}월 ${startDay}일~${endMonth}월 ${endDay}일`;
}

function formatEndTime(time: Date): string {
  const h = time.getHours();
  const min = time.getMinutes();
  const ampm = h < 12 ? '오전' : '오후';
  const hour = h % 12 === 0 ? 12 : h % 12;
  if (min === 0) return `${ampm} ${hour}시 까지`;
  return `${ampm} ${hour}시 ${min}분 까지`;
}

// ─── Wheel Picker ─────────────────────────────────────────────────────────────

const ITEM_H = 46;
const VISIBLE = 5;
const PICKER_H = ITEM_H * VISIBLE;
const PAD = ITEM_H * Math.floor(VISIBLE / 2);

const AM_PM = ['오전', '오후'];
const HOURS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const MINUTES = ['00', '30'];

function timeToIndexes(t: Date) {
  const h = t.getHours();
  const m = t.getMinutes();
  return {
    ap: h < 12 ? 0 : 1,
    hr: (h % 12 === 0 ? 12 : h % 12) - 1,
    mn: m >= 30 ? 1 : 0,
  };
}

function indexesToTime(ap: number, hr: number, mn: number): Date {
  const hv = hr + 1;
  const h24 = ap === 0 ? (hv === 12 ? 0 : hv) : hv === 12 ? 12 : hv + 12;
  const d = new Date();
  d.setHours(h24, mn * 30, 0, 0);
  return d;
}

// ─── WheelColumn ──────────────────────────────────────────────────────────────

type ColProps = {
  data: string[];
  selectedIndex: number;
  flex?: number;
  onIndexChange: (i: number) => void;
};

function WheelColumn({ data, selectedIndex, flex = 1, onIndexChange }: ColProps) {
  const ref = useRef<ScrollView>(null);
  const mounted = useRef(false);
  const prevSelected = useRef(selectedIndex);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      const t = setTimeout(() => {
        ref.current?.scrollTo({ y: selectedIndex * ITEM_H, animated: false });
      }, 50);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (mounted.current && prevSelected.current !== selectedIndex) {
      prevSelected.current = selectedIndex;
      ref.current?.scrollTo({ y: selectedIndex * ITEM_H, animated: true });
    }
  }, [selectedIndex]);

  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.max(
      0,
      Math.min(data.length - 1, Math.round(e.nativeEvent.contentOffset.y / ITEM_H))
    );
    if (i !== prevSelected.current) {
      prevSelected.current = i;
      onIndexChange(i);
    }
  };

  return (
    <ScrollView
      ref={ref}
      style={{ flex, height: PICKER_H }}
      contentContainerStyle={{ paddingVertical: PAD }}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_H}
      decelerationRate="fast"
      onMomentumScrollEnd={onEnd}
      onScrollEndDrag={onEnd}>
      {data.map((item, i) => (
        <View key={i} style={{ height: ITEM_H, alignItems: 'center', justifyContent: 'center' }}>
          <Text
            style={{
              fontSize: i === selectedIndex ? 15 : 14,
              color: i === selectedIndex ? COLORS.primary : '#9CA3AF',
              fontWeight: i === selectedIndex ? '600' : '400',
            }}>
            {item}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

// ─── TimePicker ───────────────────────────────────────────────────────────────

function TimePicker({ initial, onChange }: { initial: Date; onChange: (t: Date) => void }) {
  const idx = timeToIndexes(initial);
  const [ap, setAp] = useState(idx.ap);
  const [hr, setHr] = useState(idx.hr);
  const [mn, setMn] = useState(idx.mn);
  const apR = useRef(idx.ap);
  const hrR = useRef(idx.hr);
  const mnR = useRef(idx.mn);

  const emit = (a: number, h: number, m: number) => onChange(indexesToTime(a, h, m));

  return (
    <View style={{ height: PICKER_H }}>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: PAD,
          left: 0,
          right: 0,
          height: ITEM_H,
          backgroundColor: '#F3F4F6',
          borderRadius: 10,
        }}
      />
      <View style={{ flexDirection: 'row', flex: 1 }}>
        <WheelColumn
          data={AM_PM}
          selectedIndex={ap}
          flex={1.4}
          onIndexChange={(i) => {
            apR.current = i;
            setAp(i);
            emit(i, hrR.current, mnR.current);
          }}
        />
        <WheelColumn
          data={HOURS}
          selectedIndex={hr}
          flex={1}
          onIndexChange={(i) => {
            hrR.current = i;
            setHr(i);
            emit(apR.current, i, mnR.current);
          }}
        />
        <WheelColumn
          data={MINUTES}
          selectedIndex={mn}
          flex={1}
          onIndexChange={(i) => {
            mnR.current = i;
            setMn(i);
            emit(apR.current, hrR.current, i);
          }}
        />
      </View>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AuctionPeriodPicker({ value, onChange }: AuctionPeriodPickerProps) {
  const today = useRef(
    (() => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    })()
  ).current;

  const days = useRef(buildDays(today)).current;

  const initializedRef = useRef(false);
  const [endDate, setEndDate] = useState<Date | null>(() => {
    if (value) {
      initializedRef.current = true;
      const d = new Date(value);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    return null;
  });
  const [endTimeOfDay, setEndTimeOfDay] = useState<Date | null>(() =>
    value ? new Date(value) : null
  );
  const [expanded, setExpanded] = useState<'date' | 'time' | null>(null);
  const [tempTime, setTempTime] = useState<Date>(value ?? new Date());

  // Fix 2: useEffect prevents render-phase setState on async prefill (edit screen)
  useEffect(() => {
    if (value && !initializedRef.current) {
      initializedRef.current = true;
      const d = new Date(value);
      d.setHours(0, 0, 0, 0);
      setEndDate(d);
      setEndTimeOfDay(new Date(value));
      setTempTime(new Date(value));
    }
  }, [value]);

  const notify = (date: Date | null, time: Date | null) => {
    if (date && time) onChange(combineDateTime(date, time));
    else onChange(null);
  };

  const handleSelectDay = (day: Date) => {
    setEndDate(day);
    notify(day, endTimeOfDay);
  };

  const handleTimeChange = (t: Date) => {
    setTempTime(t);
    setEndTimeOfDay(t);
    notify(endDate, t);
  };

  const toggleSection = (section: 'date' | 'time') => {
    setExpanded((prev) => (prev === section ? null : section));
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => toggleSection('date')}
        className="flex-row items-center justify-between border-b border-gray-200 py-4">
        <Text className="text-base text-gray-400">날짜</Text>
        <Text className={endDate ? 'text-base text-black' : 'text-base text-gray-400'}>
          {endDate ? formatPeriodRange(today, endDate) : '기간을 선택해주세요'}
        </Text>
      </TouchableOpacity>

      {expanded === 'date' && (
        <View style={{ paddingVertical: 14 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 10 }}>
            {days[0].getMonth() + 1}월
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(() => {
              const selectedDayIndex = endDate ? days.findIndex((d) => isSameDay(d, endDate)) : -1;
              const pillWidth =
                selectedDayIndex > 0 ? selectedDayIndex * (CELL_W + CELL_GAP) + CIRCLE : 0;
              const pillLeft = (CELL_W - CIRCLE) / 2;

              return (
                <View
                  style={{
                    flexDirection: 'row',
                    gap: CELL_GAP,
                    position: 'relative',
                    alignItems: 'flex-start',
                  }}>
                  {selectedDayIndex > 0 && (
                    <View
                      pointerEvents="none"
                      style={{
                        position: 'absolute',
                        top: PILL_TOP,
                        left: pillLeft,
                        width: pillWidth,
                        height: CIRCLE,
                        backgroundColor: `${COLORS.primary}22`,
                        borderRadius: CIRCLE / 2,
                      }}
                    />
                  )}
                  {days.map((day, index) => {
                    const isSelected = selectedDayIndex === index;
                    const isToday = index === 0;
                    const dayLabel = isToday ? '오늘' : DAYS[day.getDay()];

                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleSelectDay(day)}
                        style={{
                          width: CELL_W,
                          alignItems: 'center',
                          paddingVertical: CELL_PAD_V,
                        }}>
                        <Text
                          style={{
                            fontSize: 11,
                            lineHeight: LABEL_LINE_H,
                            color: isSelected ? COLORS.primary : '#6B7280',
                            marginBottom: 4,
                          }}>
                          {dayLabel}
                        </Text>
                        <View
                          style={{
                            width: CIRCLE,
                            height: CIRCLE,
                            borderRadius: CIRCLE / 2,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isSelected ? COLORS.primary : 'transparent',
                          }}>
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: '600',
                              color: isSelected ? 'white' : isToday ? COLORS.primary : '#1F2937',
                            }}>
                            {day.getDate()}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })()}
          </ScrollView>
        </View>
      )}

      <TouchableOpacity
        onPress={() => toggleSection('time')}
        className="flex-row items-center justify-between border-b border-gray-200 py-4">
        <Text className="text-base text-gray-400">시간</Text>
        <Text className={endTimeOfDay ? 'text-base text-black' : 'text-base text-gray-400'}>
          {endTimeOfDay ? formatEndTime(endTimeOfDay) : '시간을 선택해주세요'}
        </Text>
      </TouchableOpacity>

      {expanded === 'time' && (
        <View className="py-3">
          <TimePicker initial={tempTime} onChange={handleTimeChange} />
        </View>
      )}
    </View>
  );
}
