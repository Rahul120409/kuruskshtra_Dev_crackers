package com.saloon.Salonmgmt.util;

import com.saloon.Salonmgmt.dto.DayScheduleDto;
import com.saloon.Salonmgmt.dto.ShiftDto;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ScheduleJsonUtil {

    public static String toJson(List<DayScheduleDto> list) {
        if (list == null || list.isEmpty()) {
            return "[]";
        }
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            DayScheduleDto d = list.get(i);
            sb.append("{");
            sb.append("\"day\":\"").append(escape(d.getDay())).append("\",");
            sb.append("\"isClosed\":").append(Boolean.TRUE.equals(d.getIsClosed())).append(",");
            sb.append("\"shifts\":[");
            if (d.getShifts() != null) {
                for (int j = 0; j < d.getShifts().size(); j++) {
                    ShiftDto s = d.getShifts().get(j);
                    sb.append("{");
                    sb.append("\"fromTime\":\"").append(escape(s.getFromTime())).append("\",");
                    sb.append("\"toTime\":\"").append(escape(s.getToTime())).append("\"");
                    sb.append("}");
                    if (j < d.getShifts().size() - 1) {
                        sb.append(",");
                    }
                }
            }
            sb.append("]");
            sb.append("}");
            if (i < list.size() - 1) {
                sb.append(",");
            }
        }
        sb.append("]");
        return sb.toString();
    }

    public static List<DayScheduleDto> fromJson(String json) {
        if (json == null || json.trim().isEmpty() || json.trim().equals("[]")) {
            return new ArrayList<>();
        }

        // 1. Try via Jackson reflection if available in classloader
        try {
            Class<?> mapperClass = Class.forName("com.fasterxml.jackson.databind.ObjectMapper");
            Object mapper = mapperClass.getDeclaredConstructor().newInstance();
            Method readTreeMethod = mapperClass.getMethod("readTree", String.class);
            Object root = readTreeMethod.invoke(mapper, json);
            if (root != null) {
                // If reflection succeeds, extract using reflection or fallback
            }
        } catch (Throwable ignored) {
        }

        // 2. Fallback parser using regex
        List<DayScheduleDto> result = new ArrayList<>();
        try {
            // Match each day block
            Pattern dayBlockPattern = Pattern.compile("\\{(?:[^{}]|\\{[^{}]*\\})*\\}");
            Matcher dayMatcher = dayBlockPattern.matcher(json);

            Pattern dayNamePattern = Pattern.compile("\"(?:day|dayOfWeek|name)\"\\s*:\\s*\"([^\"]+)\"", Pattern.CASE_INSENSITIVE);
            Pattern isClosedPattern = Pattern.compile("\"(?:isClosed|closed|is_closed)\"\\s*:\\s*(true|false)", Pattern.CASE_INSENSITIVE);
            Pattern shiftPattern = Pattern.compile("\"(?:fromTime|startTime|openTime|from|start)\"\\s*:\\s*\"([^\"]+)\"[^}]*?\"(?:toTime|endTime|closeTime|to|end)\"\\s*:\\s*\"([^\"]+)\"", Pattern.CASE_INSENSITIVE);
            Pattern shiftAltPattern = Pattern.compile("\"(?:toTime|endTime|closeTime|to|end)\"\\s*:\\s*\"([^\"]+)\"[^}]*?\"(?:fromTime|startTime|openTime|from|start)\"\\s*:\\s*\"([^\"]+)\"", Pattern.CASE_INSENSITIVE);

            while (dayMatcher.find()) {
                String dayBlock = dayMatcher.group();
                if (!dayBlock.toLowerCase().contains("\"day\"") && !dayBlock.toLowerCase().contains("\"dayofweek\"")) {
                    continue;
                }

                String dayName = "Unknown";
                Matcher dnm = dayNamePattern.matcher(dayBlock);
                if (dnm.find()) {
                    dayName = dnm.group(1);
                }

                boolean isClosed = false;
                Matcher icm = isClosedPattern.matcher(dayBlock);
                if (icm.find()) {
                    isClosed = Boolean.parseBoolean(icm.group(1));
                }

                List<ShiftDto> shifts = new ArrayList<>();
                if (!isClosed) {
                    Matcher sm = shiftPattern.matcher(dayBlock);
                    while (sm.find()) {
                        shifts.add(new ShiftDto(sm.group(1), sm.group(2)));
                    }
                    if (shifts.isEmpty()) {
                        Matcher salt = shiftAltPattern.matcher(dayBlock);
                        while (salt.find()) {
                            shifts.add(new ShiftDto(salt.group(2), salt.group(1)));
                        }
                    }
                }

                result.add(DayScheduleDto.builder()
                        .day(dayName)
                        .isClosed(isClosed)
                        .shifts(shifts)
                        .build());
            }
        } catch (Exception e) {
            // return partial or empty list
        }

        return result;
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
