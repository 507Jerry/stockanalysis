/**
 * 趋势连续摘要卡片组件
 * 显示最长上涨和下跌连续段的摘要信息
 */
'use client';

import React from 'react';
import {
  StreakSegment,
  StreakAnalysisResult,
} from '@/app/lib/streakAnalyzer';

interface StreakSummaryCardsProps {
  streakAnalysis: StreakAnalysisResult | null;
}

export default function StreakSummaryCards({
  streakAnalysis,
}: StreakSummaryCardsProps) {
  if (!streakAnalysis || (!streakAnalysis.maxUp && !streakAnalysis.maxDown)) {
    return null;
  }

  const { maxUp, maxDown, recovery, longestFirstRecovery } = streakAnalysis;

  return (
    <div className="space-y-4 mb-6">
      {/* 连续段摘要 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 最长上涨连续段 */}
        {maxUp && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📈</span>
            <h3 className="text-lg font-semibold text-gray-800">
              最长上涨连续段
            </h3>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">连续天数</span>
              <span className="text-xl font-bold text-green-600">
                {maxUp.days} 天
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">复合涨幅</span>
              <span className="text-xl font-bold text-green-600">
                +{maxUp.percent.toFixed(2)}%
              </span>
            </div>
            {maxUp.dates && maxUp.dates.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">日期范围</p>
                <p className="text-sm text-gray-700">
                  {maxUp.dates[0]} 至 {maxUp.dates[maxUp.dates.length - 1]}
                </p>
              </div>
            )}
            {/* 价格信息 */}
            {(maxUp.startPrice !== null && maxUp.startPrice !== undefined) ||
            (maxUp.endPrice !== null && maxUp.endPrice !== undefined) ? (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2 font-semibold">价格信息</p>
                <div className="space-y-1">
                  {maxUp.startPrice !== null && maxUp.startPrice !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">起始价格</span>
                      <span className="text-sm font-semibold text-gray-800">
                        ${maxUp.startPrice.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {maxUp.endPrice !== null && maxUp.endPrice !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">结束价格</span>
                      <span className="text-sm font-semibold text-gray-800">
                        ${maxUp.endPrice.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {maxUp.priceChange !== null && maxUp.priceChange !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">涨跌金额</span>
                      <span
                        className={`text-sm font-semibold ${
                          maxUp.priceChange >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {maxUp.priceChange >= 0 ? '+' : ''}
                        ${maxUp.priceChange.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        )}

        {/* 最长下跌连续段 */}
        {maxDown && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📉</span>
            <h3 className="text-lg font-semibold text-gray-800">
              最长下跌连续段
            </h3>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">连续天数</span>
              <span className="text-xl font-bold text-red-600">
                {maxDown.days} 天
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">复合跌幅</span>
              <span className="text-xl font-bold text-red-600">
                {maxDown.percent.toFixed(2)}%
              </span>
            </div>
            {maxDown.dates && maxDown.dates.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">日期范围</p>
                <p className="text-sm text-gray-700">
                  {maxDown.dates[0]} 至{' '}
                  {maxDown.dates[maxDown.dates.length - 1]}
                </p>
              </div>
            )}
            {/* 价格信息 */}
            {(maxDown.startPrice !== null && maxDown.startPrice !== undefined) ||
            (maxDown.endPrice !== null && maxDown.endPrice !== undefined) ? (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2 font-semibold">价格信息</p>
                <div className="space-y-1">
                  {maxDown.startPrice !== null && maxDown.startPrice !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">起始价格</span>
                      <span className="text-sm font-semibold text-gray-800">
                        ${maxDown.startPrice.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {maxDown.endPrice !== null && maxDown.endPrice !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">结束价格</span>
                      <span className="text-sm font-semibold text-gray-800">
                        ${maxDown.endPrice.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {maxDown.priceChange !== null && maxDown.priceChange !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">涨跌金额</span>
                      <span
                        className={`text-sm font-semibold ${
                          maxDown.priceChange >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {maxDown.priceChange >= 0 ? '+' : ''}
                        ${maxDown.priceChange.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        )}
      </div>

      {/* 恢复周期分析 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 上涨段恢复时间 */}
        {maxUp && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🔄</span>
              <h3 className="text-lg font-semibold text-gray-800">
                最长上涨段恢复周期
              </h3>
            </div>
            <div className="mt-4">
              {recovery.upRecovery.recovered ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">恢复天数</span>
                    <span className="text-xl font-bold text-blue-600">
                      {recovery.upRecovery.recoveryDays} 天
                    </span>
                  </div>
                  {recovery.upRecovery.recoveryDate && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">恢复日期</p>
                      <p className="text-sm text-gray-700">
                        {recovery.upRecovery.recoveryDate}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    价格已恢复到连涨前水平
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-lg font-semibold text-gray-500">
                    尚未恢复
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    价格尚未恢复到连涨前水平
                  </p>
                </div>
              )}
              
              {/* 价格信息 */}
              {(recovery.upRecovery.startPrice !== null && recovery.upRecovery.startPrice !== undefined) ||
              (recovery.upRecovery.endPrice !== null && recovery.upRecovery.endPrice !== undefined) ? (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2 font-semibold">价格信息</p>
                  <div className="space-y-1">
                    {recovery.upRecovery.startPrice !== null && recovery.upRecovery.startPrice !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">起始价格</span>
                        <span className="text-sm font-semibold text-gray-800 text-right">
                          ${recovery.upRecovery.startPrice.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {recovery.upRecovery.endPrice !== null && recovery.upRecovery.endPrice !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">结束价格</span>
                        <span className="text-sm font-semibold text-gray-800 text-right">
                          ${recovery.upRecovery.endPrice.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {recovery.upRecovery.priceChange !== null && recovery.upRecovery.priceChange !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">涨跌金额</span>
                        <span
                          className={`text-sm font-semibold text-right ${
                            recovery.upRecovery.priceChange >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {recovery.upRecovery.priceChange >= 0 ? '+' : ''}
                          ${recovery.upRecovery.priceChange.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {recovery.upRecovery.priceChangePercent !== null && recovery.upRecovery.priceChangePercent !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">涨跌百分比</span>
                        <span
                          className={`text-sm font-semibold text-right ${
                            recovery.upRecovery.priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {recovery.upRecovery.priceChangePercent >= 0 ? '+' : ''}
                          {recovery.upRecovery.priceChangePercent.toFixed(2)}%
                        </span>
                      </div>
                    )}
                    {recovery.upRecovery.recoveryPrice !== null && recovery.upRecovery.recoveryPrice !== undefined && (
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-600">恢复价格</span>
                        <span className="text-sm font-semibold text-blue-600 text-right">
                          ${recovery.upRecovery.recoveryPrice.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {recovery.upRecovery.recoveryPercent !== null && recovery.upRecovery.recoveryPercent !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">恢复百分比</span>
                        <span className="text-sm font-semibold text-blue-600 text-right">
                          {recovery.upRecovery.recoveryPercent >= 0 ? '+' : ''}
                          {recovery.upRecovery.recoveryPercent.toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* 下跌段恢复时间 */}
        {maxDown && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🔄</span>
              <h3 className="text-lg font-semibold text-gray-800">
                最长下跌段恢复周期
              </h3>
            </div>
            <div className="mt-4">
              {recovery.downRecovery.recovered ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">恢复天数</span>
                    <span className="text-xl font-bold text-blue-600">
                      {recovery.downRecovery.recoveryDays} 天
                    </span>
                  </div>
                  {recovery.downRecovery.recoveryDate && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">恢复日期</p>
                      <p className="text-sm text-gray-700">
                        {recovery.downRecovery.recoveryDate}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    价格已恢复到连跌前水平
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-lg font-semibold text-gray-500">
                    尚未恢复
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    价格尚未恢复到连跌前水平
                  </p>
                </div>
              )}
              
              {/* 价格信息 */}
              {(recovery.downRecovery.startPrice !== null && recovery.downRecovery.startPrice !== undefined) ||
              (recovery.downRecovery.endPrice !== null && recovery.downRecovery.endPrice !== undefined) ? (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2 font-semibold">价格信息</p>
                  <div className="space-y-1">
                    {recovery.downRecovery.startPrice !== null && recovery.downRecovery.startPrice !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">起始价格</span>
                        <span className="text-sm font-semibold text-gray-800 text-right">
                          ${recovery.downRecovery.startPrice.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {recovery.downRecovery.endPrice !== null && recovery.downRecovery.endPrice !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">结束价格</span>
                        <span className="text-sm font-semibold text-gray-800 text-right">
                          ${recovery.downRecovery.endPrice.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {recovery.downRecovery.priceChange !== null && recovery.downRecovery.priceChange !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">涨跌金额</span>
                        <span
                          className={`text-sm font-semibold text-right ${
                            recovery.downRecovery.priceChange >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {recovery.downRecovery.priceChange >= 0 ? '+' : ''}
                          ${recovery.downRecovery.priceChange.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {recovery.downRecovery.priceChangePercent !== null && recovery.downRecovery.priceChangePercent !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">涨跌百分比</span>
                        <span
                          className={`text-sm font-semibold text-right ${
                            recovery.downRecovery.priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {recovery.downRecovery.priceChangePercent >= 0 ? '+' : ''}
                          {recovery.downRecovery.priceChangePercent.toFixed(2)}%
                        </span>
                      </div>
                    )}
                    {recovery.downRecovery.recoveryPrice !== null && recovery.downRecovery.recoveryPrice !== undefined && (
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-600">恢复价格</span>
                        <span className="text-sm font-semibold text-blue-600 text-right">
                          ${recovery.downRecovery.recoveryPrice.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {recovery.downRecovery.recoveryPercent !== null && recovery.downRecovery.recoveryPercent !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">恢复百分比</span>
                        <span className="text-sm font-semibold text-blue-600 text-right">
                          {recovery.downRecovery.recoveryPercent >= 0 ? '+' : ''}
                          {recovery.downRecovery.recoveryPercent.toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* 全部区间中恢复周期最长的一段（First-Recovery Longest Cycle） */}
      {longestFirstRecovery && (
        <div className="bg-white rounded-lg shadow-sm border-2 border-blue-300 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📘</span>
            <h3 className="text-lg font-semibold text-gray-800">
              全部区间中恢复周期最长的一段（First-Recovery Longest Cycle）
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">来源</p>
              <p
                className={`text-sm font-semibold ${
                  longestFirstRecovery.streakType === 'up'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {longestFirstRecovery.streakType === 'up'
                  ? '上涨段'
                  : '下跌段'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">连续天数</p>
              <p className="text-sm font-bold text-gray-800">
                {longestFirstRecovery.streakDays} 天
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">涨跌幅</p>
              <p
                className={`text-sm font-bold ${
                  longestFirstRecovery.streakPercent >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {longestFirstRecovery.streakPercent >= 0 ? '+' : ''}
                {longestFirstRecovery.streakPercent.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">恢复天数</p>
              <p className="text-sm font-bold text-blue-600">
                {longestFirstRecovery.firstRecoveryDays} 天
              </p>
            </div>
          </div>
          {/* 区间涨跌数值 */}
          {(longestFirstRecovery.startPrice !== null ||
            longestFirstRecovery.endPrice !== null ||
            longestFirstRecovery.priceChange !== null) && (
            <div className="mb-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-3 font-semibold">
                区间涨跌数值
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {longestFirstRecovery.startPrice !== null && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">起始价格</p>
                    <p className="text-sm font-bold text-gray-800">
                      ${longestFirstRecovery.startPrice.toFixed(2)}
                    </p>
                  </div>
                )}
                {longestFirstRecovery.endPrice !== null && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">结束价格</p>
                    <p className="text-sm font-bold text-gray-800">
                      ${longestFirstRecovery.endPrice.toFixed(2)}
                    </p>
                  </div>
                )}
                {longestFirstRecovery.priceChange !== null && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">涨跌金额</p>
                    <p
                      className={`text-sm font-bold ${
                        longestFirstRecovery.priceChange >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {longestFirstRecovery.priceChange >= 0 ? '+' : ''}
                      ${longestFirstRecovery.priceChange.toFixed(2)}
                    </p>
                  </div>
                )}
                {longestFirstRecovery.priceChangePercent !== null && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">涨跌百分比</p>
                    <p
                      className={`text-sm font-bold ${
                        longestFirstRecovery.priceChangePercent >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {longestFirstRecovery.priceChangePercent >= 0 ? '+' : ''}
                      {longestFirstRecovery.priceChangePercent.toFixed(2)}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 恢复价格 */}
          {longestFirstRecovery.recoveryPrice !== null && (
            <div className="mb-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-3 font-semibold">
                恢复价格
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">恢复价格</p>
                  <p className="text-lg font-bold text-blue-600">
                    ${longestFirstRecovery.recoveryPrice.toFixed(2)}
                  </p>
                </div>
                {longestFirstRecovery.firstRecoveryPercent !== null && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">恢复百分比</p>
                    <p className="text-lg font-bold text-blue-600">
                      {longestFirstRecovery.firstRecoveryPercent >= 0 ? '+' : ''}
                      {longestFirstRecovery.firstRecoveryPercent.toFixed(2)}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-xs text-gray-500 mb-1">区间</p>
              <p className="text-sm text-gray-700">
                {longestFirstRecovery.startDate} 至{' '}
                {longestFirstRecovery.endDate}
              </p>
            </div>
            {longestFirstRecovery.recoveryDate && (
              <div>
                <p className="text-xs text-gray-500 mb-1">恢复日期</p>
                <p className="text-sm text-gray-700">
                  {longestFirstRecovery.recoveryDate}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

